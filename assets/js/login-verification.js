$(document).ready(function() {
    const protocol = $(location).attr('protocol');
    const base_domain = Init.getBaseDomain();

    verifyLogin();

    function verifyLogin(){
        // Retrieve uuid from session storage
        var $uuid = sessionStorage.getItem('uuid');
        var $access_token = Init.getToken();

        if ($uuid === null) {
            window.location.href = './login';
        }

        if ($access_token !== null) {
            window.location.href = '../home';
        }
    }

    $('#login-verification-form').on('submit', function(event) {
        event.preventDefault();
        $('#message-container').html('');
        $('#submit').prop("disabled", true);

        var $uuid = sessionStorage.getItem('uuid');
        var $token = $('#token').val();

        $.ajax({
            type: 'POST',
            url: protocol + '//api.' + base_domain + '/v1/users/verify-login',
            data: {
                uuid: $uuid,
                token: $token,
            },
            error: function(response) {
                var err = JSON.parse(response.responseText);
                var errorHtml = Init.generateErrorHtml(err.message);
                $('#message-container').html(errorHtml);
                $('#submit').prop("disabled", false);
            },
            success: function (response) {
                var $status = response.status;

                if ($status === 'success') {
                    var successHtml = Init.generateSuccessHtml(response.message);
                    $('#message-container').html(successHtml);

                    sessionStorage.setItem('access_token', response.data.access_token);
                    window.location.href = '../home';
                }
            }
        });
    });
});