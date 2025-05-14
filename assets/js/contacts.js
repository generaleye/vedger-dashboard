$(document).ready(function() {
    const protocol = $(location).attr('protocol');
    const base_domain = getBaseDomain();

    function getBaseDomain() {
        const hostname = $(location).attr('hostname');
        const domain_parts = hostname.split('.');
        domain_parts.shift();
        return domain_parts.join('.');
    }

    // Function to handle loading contacts
    function loadContacts() {
        // Retrieve token from session storage
        var token = sessionStorage.getItem('access_token');

        $.ajax({
            type: 'GET',
            url: protocol + '//api.' + base_domain + '/v1/contacts',
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + token);
            },
            error: function(response) {
                var err = JSON.parse(response.responseText);
                var errorHtml = generateErrorHtml(err.message);
                $('#message-container').html(errorHtml);
            },
            success: function (response) {
                $('#contact-container').html('');

                var data = response.data;

                if (data.length === 0) {
                    var $contact_row = $('<tr>');
                    $contact_row.append($('<td>').addClass('text-center').attr('colspan', 7)
                        .html('No Data Available')
                    );

                    $('#contact-container').append($contact_row);
                }

                $.each(data, function (key) {
                    var valuatedWithoutZ= data[key].created_at.substring(0,data[key].created_at.length-1);
                    var valuatedWithoutZDate= new Date(valuatedWithoutZ);

                    var $contact_row = $('<tr>');
                    $contact_row.append($('<td>').html(data[key].contact.first_name));
                    $contact_row.append($('<td>').html(data[key].contact.last_name));
                    $contact_row.append($('<td>').html(data[key].contact.email_address));
                    $contact_row.append($('<td>').html(data[key].contact.phone_number));
                    if (data[key].description.length > 80) {
                        $contact_row.append($('<td>').html(data[key].description.substring(0, 75) + ' ...'));
                    } else {
                        $contact_row.append($('<td>').html(data[key].description));
                    }
                    $contact_row.append($('<td>').html(valuatedWithoutZDate.toLocaleDateString() + ' <span class="text-muted text-sm d-block">' + valuatedWithoutZDate.toLocaleTimeString() + '</span>'));
                    $contact_row.append($('<td>').addClass('text-end')
                        .html(
                            '<a class="avtar avtar-xs btn-link-secondary update-contact" id="' + data[key].id + '" href="update-contact.html?id=' + data[key].id + '" data-bs-toggle="modal" data-bs-target="#updateContactModal"><i class="ti ti-edit f-20"></i></a>' +
                            '<a class="avtar avtar-xs btn-link-secondary delete-contact" id="' + data[key].id + '" href="#"><i class="ti ti-thrash f-20"></i></a>'
                        )
                    );

                    $('#contact-container').append($contact_row);
                });
            }
        });
    }

    // Call the check login function when the page is loaded
    loadContacts();

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

    $('#add-contact').on('submit', function( event ) {
        event.preventDefault();
        $('#add-contact-message-container').html('');
        $('#add').prop("disabled", true);

        var $first_name = $('#add_contact_first_name').val();
        var $last_name = $('#add_contact_last_name').val();
        var $email_address = $('#add_contact_email_address').val();
        var $phone_number = $('#add_contact_phone_number').val();
        var $description = $('#add_contact_description').val();

        var token = sessionStorage.getItem('access_token');

        $.ajax({
            type: 'POST',
            url: protocol + '//api.' + base_domain + '/v1/contacts',
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + token);
            },
            data: {
                first_name: $first_name,
                last_name: $last_name,
                email_address: $email_address,
                phone_number: $phone_number,
                description: $description
            },
            error: function(response) {
                var err = JSON.parse(response.responseText);
                var errorHtml = generateErrorHtml(err.message);
                $('#add-contact-message-container').html(errorHtml);
                $('#add').prop("disabled", false);
            },
            success: function (response) {
                var $status = response.status;

                if ($status === 'success') {
                    var successHtml = generateSuccessHtml(response.message);
                    $('#add-contact-message-container').html(successHtml);

                    window.location.href = './contacts';
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

    $(document).on('click', '.delete-contact', function () {
        var confirm_delete = confirm('Are you sure you want to delete this contact?');
        if(confirm_delete){
            var token = sessionStorage.getItem('access_token');
            var contact_id = this.id;

            $.ajax({
                type: 'DELETE',
                url: protocol + '//api.' + base_domain + '/v1/contacts/' + contact_id,
                beforeSend: function(xhr) {
                    xhr.setRequestHeader('Authorization', 'Bearer ' + token);
                },
                success: function (response) {
                    var $status = response.status;

                    if ($status === 'success') {
                        window.location.href = './contacts';
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