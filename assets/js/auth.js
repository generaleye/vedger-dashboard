$(document).ready(function() {
    const protocol = $(location).attr('protocol');
    const base_domain = getBaseDomain();

    function getBaseDomain() {
        const hostname = $(location).attr('hostname');
        const domain_parts = hostname.split('.');
        domain_parts.shift();
        return domain_parts.join('.');
    }

    redirectIfLoggedIn();

    function redirectIfLoggedIn(){
        var $access_token = sessionStorage.getItem('access_token');

        if ($access_token !== null) {
            window.location.href = '../home';
        }
    }

    $('#signup-form').on('submit', function(event) {
        event.preventDefault();
        $('#message-container').html('');
        $('#submit').prop("disabled", true);

        var $first_name = $('#first_name').val();
        var $last_name = $('#last_name').val();
        var $email_address = $('#email_address').val();
        var $phone_number = $('#phone_number').val();
        var $password = $('#password').val();
        var $confirm_password = $('#confirm_password').val();
        var $country_id = $('#country_id').val();
        var $currency_id = $('#currency_id').val();

        $.ajax({
            type: 'POST',
            url: protocol + '//api.' + base_domain + '/v1/users/signup',
            data: {
                first_name: $first_name,
                last_name: $last_name,
                email_address: $email_address,
                phone_number: $phone_number,
                password: $password,
                password_confirmation: $confirm_password,
                country_id: $country_id,
                currency_id: $currency_id
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
                    window.location.href = './signup-successful';
                }
            }
        });
    });

    $('#login-form').on('submit', function(event) {
        event.preventDefault();
        $('#message-container').html('');
        $('#submit').prop("disabled", true);

        var $email_address = $('#email_address').val();
        var $password = $('#password').val();

        $.ajax({
            type: 'POST',
            url: protocol + '//api.' + base_domain + '/v1/users/login',
            data: {
                email_address: $email_address,
                password: $password,
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
                    $('#confirmation-message').html(successHtml);

                    sessionStorage.setItem('uuid', response.data.uuid);
                    window.location.href = './login-verification';
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