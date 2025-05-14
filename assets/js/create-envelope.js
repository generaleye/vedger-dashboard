$(document).ready(function() {
    const protocol = $(location).attr('protocol');
    const base_domain = getBaseDomain();

    function getBaseDomain() {
        const hostname = $(location).attr('hostname');
        const domain_parts = hostname.split('.');
        domain_parts.shift();
        return domain_parts.join('.');
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

                    var multipleAssets = new Choices(document.getElementById('envelope_assets'), {
                        delimiter: ',',
                        editItems: true,
                        removeItemButton: true,
                        placeholder: true,
                        placeholderValue: 'Select your assets',
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

                    var multipleContacts = new Choices(document.getElementById('envelope_contacts'), {
                        delimiter: ',',
                        editItems: true,
                        removeItemButton: true,
                        placeholder: true,
                        placeholderValue: 'Select your contacts',
                    }).setChoices(function () {
                        return contactArray
                    });
                }
            }
        });
    }

    loadAssets();
    loadContacts();

    $('#create-envelope-form').on('submit', function(event) {
        event.preventDefault();
        $('#message-container').html('');
        $('#submit').prop("disabled", true);

        var $envelope_title = $('#envelope_title').val();
        var $envelope_description = $('#envelope_description').val();
        var $envelope_assets = $('#envelope_assets').val();
        var $envelope_contacts = $('#envelope_contacts').val();

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