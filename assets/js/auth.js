$(document).ready(function() {
    const protocol = $(location).attr('protocol');
    const base_domain = getBaseDomain();

    function getBaseDomain() {
        const hostname = $(location).attr('hostname');
        const domain_parts = hostname.split('.');
        domain_parts.shift();
        return domain_parts.join('.');
    }

    $('#signup-form').on('submit', function(event) {
        event.preventDefault();

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
            },
            success: function (response) {
                var $status = response.status;

                if ($status === 'success') {
                    sessionStorage.setItem('access_token', response.data.access_token);
                    window.location.href = '../home';
                }
            }
        });
    });

    $('#login-form').on('submit', function(event) {
        event.preventDefault();
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
            },
            success: function (response) {
                var $status = response.status;

                if ($status === 'success') {
                    sessionStorage.setItem('access_token', response.data.access_token);
                    window.location.href = '../home';
                }
            }
        });
    });

    function generateErrorHtml(message) {
        return '<div class="alert alert-danger alert-dismissible fade show" role="alert">' +
            '<strong>An error occurred! </strong>' + message +
            '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>' +
            '</div>';
    }
});