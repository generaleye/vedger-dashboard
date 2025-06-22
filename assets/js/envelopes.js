$(document).ready(function() {
    const protocol = $(location).attr('protocol');
    const base_domain = getBaseDomain();

    function getBaseDomain() {
        const hostname = $(location).attr('hostname');
        const domain_parts = hostname.split('.');
        domain_parts.shift();
        return domain_parts.join('.');
    }

    // Function to handle loading envelopes
    function loadEnvelopes() {
        // Retrieve token from session storage
        var token = sessionStorage.getItem('access_token');

        $.ajax({
            type: 'GET',
            url: protocol + '//api.' + base_domain + '/v1/envelopes',
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + token);
            },
            error: function(response) {
                var err = JSON.parse(response.responseText);
                var errorHtml = generateErrorHtml(err.message);
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
                    var createdAtWithoutZ= data[key].created_at.substring(0,data[key].created_at.length-1);
                    var createdWithoutZDate= new Date(createdAtWithoutZ);

                    var sendAtWithoutZ= data[key].scheduled_send_at.substring(0,data[key].scheduled_send_at.length-1);
                    var sendWithoutZDate= new Date(sendAtWithoutZ);

                    var $envelope_row = $('<tr>');
                    console.log('title: '+data[key].title.length);
                    if (data[key].title.length > 40) {
                        $envelope_row.append($('<td>').html(data[key].title.substring(0, 35) + ' ...'));
                    } else {
                        $envelope_row.append($('<td>').html(data[key].title));
                    }
                    console.log('description: '+data[key].description.length);
                    if (data[key].description.length > 40) {
                        $envelope_row.append($('<td>').html(data[key].description.substring(0, 35) + ' ...'));
                    } else {
                        $envelope_row.append($('<td>').html(data[key].description));
                    }
                    $envelope_row.append($('<td>').html(data[key].alert_frequency.charAt(0).toUpperCase() + data[key].alert_frequency.slice(1)));
                    $envelope_row.append($('<td>').html(sendWithoutZDate.toLocaleDateString() + ' <span class="text-muted text-sm d-block">' + sendWithoutZDate.toLocaleTimeString() + '</span>'));
                    $envelope_row.append($('<td>').html(data[key].delivery_status.charAt(0).toUpperCase() + data[key].delivery_status.slice(1)));
                    $envelope_row.append($('<td>').html(createdWithoutZDate.toLocaleDateString() + ' <span class="text-muted text-sm d-block">' + createdWithoutZDate.toLocaleTimeString() + '</span>'));
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

    // Call the check login function when the page is loaded
    loadEnvelopes();

    // load update contact modal fields
    $(document).on('click', '.update-contact', function () {
        var token = sessionStorage.getItem('access_token');
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

        var $description = $('#update_contact_description').val();
        var $contact_id = $('#contact_id').val();

        var token = sessionStorage.getItem('access_token');

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
                var errorHtml = generateErrorHtml(err.message);
                $('#update-contact-message-container').html(errorHtml);
                $('#update').prop("disabled", false);
            },
            success: function (response) {
                var $status = response.status;

                if ($status === 'success') {
                    var successHtml = generateSuccessHtml(response.message);
                    $('#update-contact-message-container').html(successHtml);

                    window.location.href = './contacts';
                }
            }
        });
    });

    $(document).on('click', '.delete-envelope', function () {
        var confirm_delete = confirm('Are you sure you want to delete this envelope?');
        if(confirm_delete){
            var token = sessionStorage.getItem('access_token');
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
                        var successHtml = generateSuccessHtml(response.message);
                        $('#message-container').html(successHtml);

                        window.location.href = './envelopes';
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