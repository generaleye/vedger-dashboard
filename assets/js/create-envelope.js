$(document).ready(function() {
    const protocol = $(location).attr('protocol');
    const base_domain = getBaseDomain();

    function getBaseDomain() {
        const hostname = $(location).attr('hostname');
        const domain_parts = hostname.split('.');
        domain_parts.shift();
        return domain_parts.join('.');
    }

    function loadOnceFrequencyInitialDate() {
        var now= new Date();
        let currentDateISOWithoutZDateLocal = new Date(now.getTime()-now.getTimezoneOffset()*60000);
        currentDateISOWithoutZDateLocal.setDate(currentDateISOWithoutZDateLocal.getDate())
        currentDateISOWithoutZDateLocal = currentDateISOWithoutZDateLocal.toISOString().substring(0,16);
        $('#scheduled_send_date').val(currentDateISOWithoutZDateLocal).attr('min', currentDateISOWithoutZDateLocal);
    }
    function frequencyChangeListener() {
        $('#envelope_frequency').change(
            function(){
                var now= new Date();
                var days = 1;
                if ($(this).val() === 'once') {
                    days = 1;
                    $( "#scheduled_send_date" ).prop( "disabled", false );
                } else if ($(this).val() === 'monthly') {
                    days = 30;
                    $( "#scheduled_send_date" ).prop( "disabled", true );
                } else if ($(this).val() === 'quarterly') {
                    days = 90;
                    $( "#scheduled_send_date" ).prop( "disabled", true );
                } else if ($(this).val() === 'yearly') {
                    days = 365;
                    $( "#scheduled_send_date" ).prop( "disabled", true );
                }

                let currentDateISOWithoutZDateLocal = new Date(now.getTime()-now.getTimezoneOffset()*60000);
                currentDateISOWithoutZDateLocal.setDate(currentDateISOWithoutZDateLocal.getDate() + days)
                currentDateISOWithoutZDateLocal = currentDateISOWithoutZDateLocal.toISOString().substring(0,16);
                $('#scheduled_send_date').val(currentDateISOWithoutZDateLocal).attr('min', currentDateISOWithoutZDateLocal);
            }
        );
    }

    function reminderSwitchListener() {
        $('#envelope_reminder_alert').change(
            function(){
                if ($(this).is(':checked')) {
                    $('#envelope_reminder_alert_label').html('Reminder Alerts Enabled');
                } else {
                    $('#envelope_reminder_alert_label').html('Reminder Alerts Disabled');
                }
            }
        );
    }

    function loadAssets() {
        var token = sessionStorage.getItem('access_token');

        $.ajax({
            type: 'GET',
            url: protocol + '//api.' + base_domain + '/v1/assets',
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + token);
            },
            success: function (response) {
                var $status = response.status;

                if ($status === 'success') {
                    var data = response.data;

                    const assetArray = data.map(asset => {
                        return {
                            value: asset.id,
                            label: asset.name,
                        };
                    });

                    new Choices(document.getElementById('envelope_assets'), {
                        delimiter: ',',
                        editItems: true,
                        removeItemButton: true,
                        placeholder: true,
                        placeholderValue: 'Select at least one of your assets',
                    }).setChoices(function () {
                        return assetArray
                    });
                }
            }
        });
    }

    function loadContacts() {
        var token = sessionStorage.getItem('access_token');

        $.ajax({
            type: 'GET',
            url: protocol + '//api.' + base_domain + '/v1/contacts',
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + token);
            },
            success: function (response) {
                var $status = response.status;

                if ($status === 'success') {
                    var data = response.data;

                    const contactArray = data.map(user_contact => {
                        return {
                            value: user_contact.id,
                            label: user_contact.contact.first_name + " " + user_contact.contact.last_name,
                        };
                    });

                    new Choices(document.getElementById('envelope_contacts'), {
                        delimiter: ',',
                        editItems: true,
                        removeItemButton: true,
                        placeholder: true,
                        placeholderValue: 'Select at least one of your contacts',
                    }).setChoices(function () {
                        return contactArray
                    });
                }
            }
        });
    }

    loadOnceFrequencyInitialDate();
    frequencyChangeListener();
    reminderSwitchListener();
    loadAssets();
    loadContacts();

    $('#create-envelope-form').on('submit', function(event) {
        event.preventDefault();
        $('#message-container').html('');
        $('#submit').prop("disabled", true);

        var $envelope_title = $('#envelope_title').val();
        var $envelope_description = $('#envelope_description').val();
        var $envelope_frequency = $('#envelope_frequency').val();
        var $scheduled_send_date = $('#scheduled_send_date').val();
        var $reminder_alert = $('#envelope_reminder_alert').is(":checked");
        var $envelope_assets = $('#envelope_assets').val();
        var $envelope_contacts = $('#envelope_contacts').val();

        var minimumCountError = false;

        if ($envelope_assets.length < 1) {
            minimumCountError = true;
            // $('#message-container').html("Please select at least one asset");
            alert("Error: Please select at least one asset");
            $('#submit').prop("disabled", false);
        }

        if (($envelope_contacts.length < 1) && (!minimumCountError)) {
            minimumCountError = true;
            // $('#message-container').html("Please select at least one contact");
            alert("Error: Please select at least one contact");
            $('#submit').prop("disabled", false);
        }

        if (!minimumCountError) {
            var token = sessionStorage.getItem('access_token');

            $.ajax({
                type: 'POST',
                url: protocol + '//api.' + base_domain + '/v1/envelopes',
                beforeSend: function(xhr) {
                    xhr.setRequestHeader('Authorization', 'Bearer ' + token);
                },
                data: {
                    title: $envelope_title,
                    description: $envelope_description,
                    frequency: $envelope_frequency,
                    scheduled_send_date: $scheduled_send_date,
                    reminder_alert: $reminder_alert ? "enabled" : "disabled",
                    assets: $envelope_assets,
                    contacts: $envelope_contacts
                },
                error: function(response) {
                    var err = JSON.parse(response.responseText);
                    var errorHtml = generateErrorHtml(err.message);
                    $('#message-container').html(errorHtml);
                    $('#submit').prop("disabled", false);
                },
                success: function (response) {
                    var $status = response.status;

                    if ($status === 'success') {
                        var successHtml = generateSuccessHtml(response.message);
                        $('#message-container').html(successHtml);

                        window.location.href = './read-envelope.html?id='+response.data.uuid;
                    }
                }
            });
        }
    });

    function generateSuccessHtml(message) {
        return '<div class="alert alert-success alert-dismissible fade show" role="alert">' +
            '   <div><i class="fas fa-check-circle"> </i> ' + message + '</div>' +
            '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>' +
            '</div>';
    }

    function generateErrorHtml(message) {
        return '<div class="alert alert-danger alert-dismissible fade show" role="alert">' +
            '   <div><i class="fas fa-exclamation-triangle"> </i> ' + message + '</div>' +
            '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>' +
            '</div>';
    }
});