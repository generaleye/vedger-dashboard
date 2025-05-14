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
        loadEnvelopeAssets(envelope_id);
        loadEnvelopeContacts(envelope_id);
    } else {
        window.location.href = './home';
    }

    // Function to get the ID from the URL
    function getIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    // Function to handle liading envelope
    function loadEnvelope(envelope_id) {
        // Retrieve token from session storage
        var token = sessionStorage.getItem('access_token');

        $.ajax({
            type: 'GET',
            url: protocol + '//api.' + base_domain + '/v1/envelopes/' + envelope_id,
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + token);
            },
            error: function (response) {
                window.location.href = './home';
            },
            success: function (response) {
                var data = response.data;

                $('#envelope-title').html(data.title);
                $('#envelope-description').html(data.description);

                $('#envelope-creator').html(data.creator.first_name + ' ' + data.creator.last_name);
                $('#envelope-created-date').html(new Date(data.created_at.substring(0, data.created_at.length - 1)).toLocaleString('en-US', {
                    year: 'numeric',
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    second: 'numeric',
                    hour12: false,
                }));
            }
        });
    }

    $('#envelope-update-button').on('click', function () {
        window.location.href = './update-envelope.html?id=' + envelope_id;
    });

    $('#envelope-delete-button').on('click', function () {
        var confirm_delete = confirm('Are you sure you want to delete this envelope?');
        if (confirm_delete) {
            var token = sessionStorage.getItem('access_token');
            $.ajax({
                type: 'DELETE',
                url: protocol + '//api.' + base_domain + '/v1/envelopes/' + envelope_id,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Authorization', 'Bearer ' + token);
                },
                success: function (response) {
                    var $status = response.status;

                    if ($status === 'success') {
                        window.location.href = './envelopes';
                    }
                }
            });
        }
    });

    function loadEnvelopeAssets(envelope_id) {
        // Retrieve token from session storage
        var token = sessionStorage.getItem('access_token');
        const envelopeAssetsArray = [];

        $.ajax({
            type: 'GET',
            url: protocol + '//api.' + base_domain + '/v1/envelopes/' + envelope_id + '/assets',
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + token);
            },
            error: function (response) {
                window.location.href = './home';
            },
            success: function (response) {
                var data = response.data;
                if (data.length === 0) {
                    var $envelope_asset_item = $('<li>').addClass('list-group-item').addClass('px-0');
                    $envelope_asset_item.append($('<h6>').addClass('mb-0').addClass('text-center')
                        .html('No Asset Added')
                    );

                    $('#envelope-assets-container').append($envelope_asset_item);
                }

                $.each(data, function (key, value) {
                    const $envelope_asset_item = $('<li>', { class: 'list-group-item px-0' });
                    const $outerDiv = $('<div>', { class: 'd-flex align-items-center' });
                    const $contentWrapper = $('<div>', { class: 'flex-grow-1 ms-3' });
                    const $row = $('<div>', { class: 'row g-1' });
                    const $colLeft = $('<div>', { class: 'col-6' })
                        .append($('<h6>', { class: 'mb-0', text: data[key].asset.name }))
                        .append(
                            $('<p>', { class: 'text-muted mb-0' }).append(
                                $('<small>', { text: data[key].asset.current_value })
                            )
                        );

                    const $colRight = $('<div>', { class: 'col-6 text-end' })
                        .append(
                            $('<a>', {
                                class: 'avtar avtar-xs btn-link-secondary view-envelope-asset',
                                id: data[key].asset.uuid,
                                href: 'read-asset.html?id='+data[key].asset.uuid,
                                // target: '_blank'
                            }).append($('<i>', { class: 'ti ti-eye f-20' }))
                        )
                        .append(
                            $('<a>', {
                                class: 'avtar avtar-xs btn-link-secondary delete-envelope-asset',
                                id: data[key].asset.uuid,
                                href: '#'
                            }).append($('<i>', { class: 'ti ti-thrash f-20' }))
                        );

                    $row.append($colLeft).append($colRight);
                    $contentWrapper.append($row);
                    $outerDiv.append($contentWrapper);
                    $envelope_asset_item.append($outerDiv);

                    envelopeAssetsArray.push(data[key].asset.uuid);

                    $('#envelope-assets-container').append($envelope_asset_item);
                });


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
                                var disabledAsset = false;

                                if (envelopeAssetsArray.includes(asset.uuid)) {
                                    disabledAsset = true;
                                }

                                return {
                                    value: asset.uuid,
                                    label: asset.name,
                                    disabled: disabledAsset
                                };
                            });

                            var multipleAssets = new Choices(document.getElementById('add-envelope-asset'), {
                                delimiter: ',',
                                editItems: true,
                                removeItemButton: true,
                                placeholder: true,
                                placeholderValue: 'Select your asset',
                            }).setChoices(function () {
                                return assetArray
                            });
                        }
                    }
                });
            }
        });
    }

    $(document).on('click', '.delete-envelope-asset', function () {
        var confirm_delete = confirm('Are you sure you want to remove this asset from the envelope?');
        if(confirm_delete){
            var token = sessionStorage.getItem('access_token');
            var asset_id = this.id;
            $.ajax({
                type: 'DELETE',
                url: protocol + '//api.' + base_domain + '/v1/envelopes/' + envelope_id + '/assets/' + asset_id,
                beforeSend: function(xhr) {
                    xhr.setRequestHeader('Authorization', 'Bearer ' + token);
                },
                success: function (response) {
                    var $status = response.status;

                    if ($status === 'success') {
                        window.location.href = './read-envelope.html?id=' + envelope_id;
                    }
                }
            });
        }
    });

    $('#add-asset-to-envelope').on('submit', function(event) {
        event.preventDefault();
        $('#add-asset-to-envelope-message-container').html('');
        $('#submit').prop("disabled", true);

        var $envelope_asset_uuid = $('#add-envelope-asset').val();

        var token = sessionStorage.getItem('access_token');

        $.ajax({
            type: 'POST',
            url: protocol + '//api.' + base_domain + '/v1/envelopes/' + envelope_id + '/assets',
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + token);
            },
            data: {
                asset_id: $envelope_asset_uuid
            },
            error: function(response) {
                var err = JSON.parse(response.responseText);
                var errorHtml = generateErrorHtml(err.message);
                $('#add-asset-to-envelope-message-container').html(errorHtml);
                $('#submit').prop("disabled", false);
            },
            success: function (response) {
                var $status = response.status;

                if ($status === 'success') {
                    var successHtml = generateSuccessHtml(response.message);
                    $('#add-asset-to-envelope-message-container').html(successHtml);

                    window.location.href = './read-envelope.html?id=' + envelope_id;
                }
            }
        });
    });

    function loadEnvelopeContacts(envelope_id) {
        // Retrieve token from session storage
        var token = sessionStorage.getItem('access_token');
        const envelopeContactsArray = [];

        $.ajax({
            type: 'GET',
            url: protocol + '//api.' + base_domain + '/v1/envelopes/' + envelope_id + '/contacts',
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + token);
            },
            error: function (response) {
                window.location.href = './home';
            },
            success: function (response) {
                var data = response.data;
                if (data.length === 0) {
                    var $envelope_contact_item = $('<li>').addClass('list-group-item').addClass('px-0');
                    $envelope_contact_item.append($('<h6>').addClass('mb-0').addClass('text-center')
                        .html('No Contact Added')
                    );

                    $('#envelope-contacts-container').append($envelope_contact_item);
                }

                $.each(data, function (key, value) {
                    const $envelope_contact_item = $('<li>', { class: 'list-group-item px-0' });
                    const $outerDiv = $('<div>', { class: 'd-flex align-items-center' });
                    const $contentWrapper = $('<div>', { class: 'flex-grow-1 ms-3' });
                    const $row = $('<div>', { class: 'row g-1' });
                    const $colLeft = $('<div>', { class: 'col-6' })
                        .append($('<h6>', { class: 'mb-0', text: data[key].user_contact.contact.first_name + ' ' + data[key].user_contact.contact.last_name }))
                        .append(
                            $('<p>', { class: 'text-muted mb-0' }).append(
                                $('<small>', { text: data[key].user_contact.description })
                            )
                        );

                    const $colRight = $('<div>', { class: 'col-6 text-end' })
                        .append(
                            $('<a>', {
                                class: 'avtar avtar-xs btn-link-secondary view-envelope-contact',
                                id: data[key].id,
                                href: 'contacts.html',
                                // target: '_blank'
                            }).append($('<i>', { class: 'ti ti-eye f-20' }))
                        )
                        .append(
                            $('<a>', {
                                class: 'avtar avtar-xs btn-link-secondary delete-envelope-contact',
                                id: data[key].id,
                                href: '#'
                            }).append($('<i>', { class: 'ti ti-thrash f-20' }))
                        );

                    $row.append($colLeft).append($colRight);
                    $contentWrapper.append($row);
                    $outerDiv.append($contentWrapper);
                    $envelope_contact_item.append($outerDiv);

                    envelopeContactsArray.push(data[key].user_contact_id);

                    $('#envelope-contacts-container').append($envelope_contact_item);
                });


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
                                var disabledContact = false;

                                if (envelopeContactsArray.includes(user_contact.id)) {
                                    disabledContact = true;
                                }

                                return {
                                    value: user_contact.id,
                                    label: user_contact.contact.first_name + " " + user_contact.contact.last_name,
                                    disabled: disabledContact
                                };
                            });

                            var multipleContacts = new Choices(document.getElementById('add-envelope-contact'), {
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
        });
    }

    $(document).on('click', '.delete-envelope-contact', function () {
        var confirm_delete = confirm('Are you sure you want to remove this contact from the envelope?');
        if(confirm_delete){
            var token = sessionStorage.getItem('access_token');
            var contact_id = this.id;
            $.ajax({
                type: 'DELETE',
                url: protocol + '//api.' + base_domain + '/v1/envelopes/' + envelope_id + '/contacts/' + contact_id,
                beforeSend: function(xhr) {
                    xhr.setRequestHeader('Authorization', 'Bearer ' + token);
                },
                success: function (response) {
                    var $status = response.status;

                    if ($status === 'success') {
                        window.location.href = './read-envelope.html?id=' + envelope_id;
                    }
                }
            });
        }
    });

    $('#add-contact-to-envelope').on('submit', function(event) {
        event.preventDefault();
        $('#add-contact-to-envelope-message-container').html('');
        $('#submit-contact').prop("disabled", true);

        var $envelope_contact_id = $('#add-envelope-contact').val();

        var token = sessionStorage.getItem('access_token');

        $.ajax({
            type: 'POST',
            url: protocol + '//api.' + base_domain + '/v1/envelopes/' + envelope_id + '/contacts',
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + token);
            },
            data: {
                user_contact_id: $envelope_contact_id
            },
            error: function(response) {
                var err = JSON.parse(response.responseText);
                var errorHtml = generateErrorHtml(err.message);
                $('#add-contact-to-envelope-message-container').html(errorHtml);
                $('#submit').prop("disabled", false);
            },
            success: function (response) {
                var $status = response.status;

                if ($status === 'success') {
                    var successHtml = generateSuccessHtml(response.message);
                    $('#add-contact-to-envelope-message-container').html(successHtml);

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