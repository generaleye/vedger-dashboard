$(document).ready(function() {
    const protocol = $(location).attr('protocol');
    const base_domain = Init.getBaseDomain();

    // Call the check login function when the page is loaded
    loadEnvelopes();

    // Function to handle loading envelopes
    function loadEnvelopes() {
        const token = Init.getToken();

        $.ajax({
            type: 'GET',
            url: protocol + '//api.' + base_domain + '/v1/envelopes',
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + token);
            },
            error: function(response) {
                var err = JSON.parse(response.responseText);
                var errorHtml = Init.generateErrorHtml(err.message);
                $('#message-container').html(errorHtml);
            },
            success: function (response) {
                $('#envelope-container').html('');

                var data = response.data;

                if (data.length === 0) {
                    var $envelope_row = $('<tr>');
                    $envelope_row.append($('<td>').addClass('text-center').attr('colspan', 7)
                        .html('No Data Available')
                    );

                    $('#envelope-container').append($envelope_row);
                }

                $.each(data, function (key) {
                    var createdAt= new Date(data[key].created_at);
                    var sendAt= new Date(data[key].scheduled_send_at);

                    var $envelope_row = $('<tr>');
                    if (data[key].title.length > 40) {
                        $envelope_row.append($('<td>').html(data[key].title.substring(0, 35) + ' ...'));
                    } else {
                        $envelope_row.append($('<td>').html(data[key].title));
                    }
                    if (data[key].description.length > 40) {
                        $envelope_row.append($('<td>').html(data[key].description.substring(0, 35) + ' ...'));
                    } else {
                        $envelope_row.append($('<td>').html(data[key].description));
                    }
                    $envelope_row.append($('<td>').html(data[key].alert_frequency.charAt(0).toUpperCase() + data[key].alert_frequency.slice(1)));
                    $envelope_row.append($('<td>').html(sendAt.toLocaleDateString() + ' <span class="text-muted text-sm d-block">' + sendAt.toLocaleTimeString() + '</span>'));
                    $envelope_row.append($('<td>').html(data[key].delivery_status.charAt(0).toUpperCase() + data[key].delivery_status.slice(1)));
                    $envelope_row.append($('<td>').html(createdAt.toLocaleDateString() + ' <span class="text-muted text-sm d-block">' + createdAt.toLocaleTimeString() + '</span>'));
                    $envelope_row.append($('<td>').addClass('text-end')
                        .html(
                            '<a class="avtar avtar-xs btn-link-secondary" href="read-envelope.html?id=' + data[key].uuid + '"><i class="ti ti-eye f-20"></i></a>' +
                            '<a class="avtar avtar-xs btn-link-secondary" href="update-envelope.html?id=' + data[key].uuid + '"><i class="ti ti-edit f-20"></i></a>' +
                            '<a class="avtar avtar-xs btn-link-secondary delete-envelope" id="' + data[key].uuid + '" href="#"><i class="ti ti-thrash f-20"></i></a>'
                        )
                    );

                    $('#envelope-container').append($envelope_row);
                });
            }
        });
    }

    // load update contact modal fields
    $(document).on('click', '.update-contact', function () {
        const token = Init.getToken();
        var contact_id = this.id;
        $.ajax({
            type: 'GET',
            url: protocol + '//api.' + base_domain + '/v1/contacts/' + contact_id,
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + token);
            },
            success: function (response) {
                var $status = response.status;

                if ($status === 'success') {
                    var data = response.data;

                    $('#update_contact_first_name').val(data.contact.first_name);
                    $('#update_contact_last_name').val(data.contact.last_name);
                    $('#update_contact_email_address').val(data.contact.email_address);
                    $('#update_contact_phone_number').val(data.contact.phone_number);
                    $('#update_contact_description').val(data.description);

                    $('#contact_id').val(contact_id);
                }
            }
        });
    });

    $('#update-contact').on('submit', function( event ) {
        event.preventDefault();
        $('#update-contact-message-container').html('');
        $('#update').prop("disabled", true);

        const token = Init.getToken();

        var $description = $('#update_contact_description').val();
        var $contact_id = $('#contact_id').val();

        $.ajax({
            type: 'PATCH',
            url: protocol + '//api.' + base_domain + '/v1/contacts/' + $contact_id,
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + token);
            },
            data: {
                description: $description
            },
            error: function(response) {
                var err = JSON.parse(response.responseText);
                var errorHtml = Init.generateErrorHtml(err.message);
                $('#update-contact-message-container').html(errorHtml);
                $('#update').prop("disabled", false);
            },
            success: function (response) {
                var $status = response.status;

                if ($status === 'success') {
                    var successHtml = Init.generateSuccessHtml(response.message);
                    $('#update-contact-message-container').html(successHtml);

                    window.location.href = './contacts';
                }
            }
        });
    });

    $(document).on('click', '.delete-envelope', function () {
        var confirm_delete = confirm('Are you sure you want to delete this envelope?');
        if(confirm_delete){
            const token = Init.getToken();
            var envelope_id = this.id;

            $.ajax({
                type: 'DELETE',
                url: protocol + '//api.' + base_domain + '/v1/envelopes/' + envelope_id,
                beforeSend: function(xhr) {
                    xhr.setRequestHeader('Authorization', 'Bearer ' + token);
                },
                success: function (response) {
                    var $status = response.status;

                    if ($status === 'success') {
                        var successHtml = Init.generateSuccessHtml(response.message);
                        $('#message-container').html(successHtml);

                        window.location.href = './envelopes';
                    }
                }
            });
        }
    });
});