$(document).ready(function() {
    const protocol = $(location).attr('protocol');
    const base_domain = getBaseDomain();

    function getBaseDomain() {
        const hostname = $(location).attr('hostname');
        const domain_parts = hostname.split('.');
        domain_parts.shift();
        return domain_parts.join('.');
    }

    // Get the resource ID from the URL
    const envelope_id = getIdFromUrl();

    // If the ID is present, fetch the resource details
    if (envelope_id) {
        loadEnvelope(envelope_id);
        frequencyChangeListener();
        reminderSwitchListener();
    } else {
        window.location.href = './envelopes';
    }

    // Function to get the ID from the URL
    function getIdFromUrl() {
        const urlParams= new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    // Function to load envelope
    function loadEnvelope(envelope_id) {
        // Retrieve token from session storage
        var token = sessionStorage.getItem('access_token');

        $.ajax({
            type: 'GET',
            url: protocol + '//api.' + base_domain + '/v1/envelopes/' + envelope_id,
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + token);
            },
            error: function() {
                window.location.href = './envelopes';
            },
            success: function (response) {
                var data = response.data;

                var dateWithoutZ  =  data.scheduled_send_at.substring(0,data.scheduled_send_at.length-1);
                var dateWithoutZDate = new Date(dateWithoutZ);
                // Format Date object to HTML datetime-local string
                const pad = (num) => String(num).padStart(2, '0');
                const htmlDateTimeLocal = `${dateWithoutZDate.getFullYear()}-${pad(dateWithoutZDate.getMonth() + 1)}-${pad(dateWithoutZDate.getDate())}T${pad(dateWithoutZDate.getHours())}:${pad(dateWithoutZDate.getMinutes())}`;

                $('#envelope_title').val(data.title);
                $('#envelope_description').val(data.description);
                $('#envelope_frequency').val(data.alert_frequency);
                $('#scheduled_send_date').val(htmlDateTimeLocal).prop( "disabled", true );

                if (data.alert_frequency === "once") {
                    $('#scheduled_send_date').prop( "disabled", false );
                }

                if (data.reminder_status === "enabled") {
                    $('#envelope_reminder_alert').prop('checked', true);
                    $('#envelope_reminder_alert_label').html('Reminder Alerts Enabled');
                } else {
                    $('#envelope_reminder_alert').prop('checked', false);
                    $('#envelope_reminder_alert_label').html('Reminder Alerts Disabled');
                }

                var now= new Date();
                const currentDateISOWithoutZDateLocal = new Date(now.getTime()-now.getTimezoneOffset()*60000).toISOString().substring(0,16);
                $('#scheduled_send_date').attr('min', currentDateISOWithoutZDateLocal);
            }
        });
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

    $('#cancel-update-button').on('click', function() {
        window.location.href = './read-envelope.html?id=' + envelope_id;
    } );

    $('#update-envelope-form').on('submit', function(event) {
        event.preventDefault();
        $('#message-container').html('');
        $('#submit').prop("disabled", true);

        var $envelope_title = $('#envelope_title').val();
        var $envelope_description = $('#envelope_description').val();
        var $envelope_frequency = $('#envelope_frequency').val();
        var $scheduled_send_date = $('#scheduled_send_date').val();
        var $reminder_alert = $('#envelope_reminder_alert').is(":checked");

        var token = sessionStorage.getItem('access_token');

        $.ajax({
            type: 'PATCH',
            url: protocol + '//api.' + base_domain + '/v1/envelopes/' + envelope_id,
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + token);
            },
            data: {
                title: $envelope_title,
                description: $envelope_description,
                frequency: $envelope_frequency,
                scheduled_send_date: $scheduled_send_date,
                reminder_alert: $reminder_alert ? "enabled" : "disabled",
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

                    window.location.href = './read-envelope.html?id=' + envelope_id;
                }
            }
        });
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