$(document).ready(function() {
    const protocol = $(location).attr('protocol');
    const base_domain = getBaseDomain();

    function getBaseDomain() {
        const hostname = $(location).attr('hostname');
        const domain_parts = hostname.split('.');
        domain_parts.shift();
        return domain_parts.join('.');
    }

    $('#change-password-form').on('submit', function(event) {
        event.preventDefault();

        var $old_password = $('#old_password').val();
        var $new_password = $('#new_password').val();
        var $new_password_confirmation = $('#new_password_confirmation').val();

        var token = sessionStorage.getItem('access_token');

        $.ajax({
            type: 'POST',
            url: protocol + '//api.' + base_domain + '/v1/users/change-password',
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + token);
            },
            data: {
                old_password: $old_password,
                new_password: $new_password,
                new_password_confirmation: $new_password_confirmation,
            },
            error: function(response) {
                var err = JSON.parse(response.responseText);
                var errorHtml = generateErrorHtml(err.message);
                $('#message-container').html(errorHtml);
            },
            success: function (response) {
                var $status = response.status;

                var successHtml = generateSuccessHtml(response.message);
                $('#message-container').html(successHtml);
            }
        });
    });

    function generateErrorHtml(message) {
        return '<div class="alert alert-danger alert-dismissible fade show" role="alert">' +
            '<strong>An error occurred! </strong>' + message +
            '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>' +
            '</div>';
    }

    function generateSuccessHtml(message) {
        return '<div class="alert alert-success alert-dismissible fade show" role="alert">' +
            '<strong>Success! </strong>' + message +
            '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>' +
            '</div>';
    }

});