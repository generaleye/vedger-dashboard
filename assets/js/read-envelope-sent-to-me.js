$(document).ready(function() {
    const protocol = $(location).attr('protocol');
    const base_domain = Init.getBaseDomain();

    // Get the resource ID from the URL
    const envelope_id = Init.getIdFromUrl();

    // If the ID is present, fetch the resource details
    if (envelope_id) {
        loadEnvelope(envelope_id);
    } else {
        window.location.href = './home';
    }

    // Function to handle liading envelope
    function loadEnvelope(envelope_id) {
        const token = Init.getToken();

        $.ajax({
            type: 'GET',
            url: protocol + '//api.' + base_domain + '/v1/envelopes/sent-to-me/' + envelope_id,
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + token);
            },
            error: function () {
                window.location.href = './home';
            },
            success: function (response) {
                var data = response.data;

                $('#envelope-title').html(data.title);
                $('#envelope-description').html(data.description);

                if (data.sent_at === null) {
                    $('#envelope-sent-date').html('N/A');
                } else {
                    $('#envelope-sent-date').html(new Date(data.sent_at).toLocaleString('en-US', {
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

                $('#envelope-creator').html(data.created_by);
                $('#envelope-created-date').html(new Date(data.created_at).toLocaleString('en-US', {
                    year: 'numeric',
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    second: 'numeric',
                    hour12: false,
                }));

                if (data.assets.length === 0) {
                    var $envelope_asset_item = $('<li>').addClass('list-group-item').addClass('px-0');
                    $envelope_asset_item.append($('<h6>').addClass('mb-0').addClass('text-center')
                        .html('No Asset Added')
                    );

                    $('#envelope-assets-container').append($envelope_asset_item);
                } else {
                    $.each(data.assets, function (key) {
                        const $envelope_asset_item = $('<li>', { class: 'list-group-item px-0' });
                        const $outerDiv = $('<div>', { class: 'd-flex align-items-center' });
                        const $contentWrapper = $('<div>', { class: 'flex-grow-1 ms-3' });
                        const $row = $('<div>', { class: 'row g-1' });
                        const $colLeft = $('<div>', { class: 'col-6' })
                            .append($('<h6>', { class: 'mb-0', text: data.assets[key].name }))
                            .append(
                                $('<p>', { class: 'text-muted mb-0' }).append(
                                    $('<small>', { text: data.assets[key].value })
                                )
                            );

                        $row.append($colLeft);
                        $contentWrapper.append($row);
                        $outerDiv.append($contentWrapper);
                        $envelope_asset_item.append($outerDiv);

                        $('#envelope-assets-container').append($envelope_asset_item);
                    });
                }

                if (data.contacts.length === 0) {
                    var $envelope_contact_item = $('<li>').addClass('list-group-item').addClass('px-0');
                    $envelope_contact_item.append($('<h6>').addClass('mb-0').addClass('text-center')
                        .html('No Contact Added')
                    );

                    $('#envelope-contacts-container').append($envelope_contact_item);
                } else {
                    $.each(data.contacts, function (key) {
                        const $envelope_contact_item = $('<li>', { class: 'list-group-item px-0' });
                        const $outerDiv = $('<div>', { class: 'd-flex align-items-center' });
                        const $contentWrapper = $('<div>', { class: 'flex-grow-1 ms-3' });
                        const $row = $('<div>', { class: 'row g-1' });
                        const $colLeft = $('<div>', { class: 'col-6' })
                            .append($('<h6>', { class: 'mb-0', text: data.contacts[key].full_name }))
                            .append(
                                $('<p>', { class: 'text-muted mb-0' }).append(
                                    $('<small>', { text: data.contacts[key].description })
                                )
                            );

                        $row.append($colLeft);
                        $contentWrapper.append($row);
                        $outerDiv.append($contentWrapper);
                        $envelope_contact_item.append($outerDiv);

                        $('#envelope-contacts-container').append($envelope_contact_item);
                    });
                }
            }
        });
    }
});