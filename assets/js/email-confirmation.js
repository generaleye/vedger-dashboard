$(document).ready(function() {
    const protocol = $(location).attr('protocol');
    const base_domain = Init.getBaseDomain();

    confirmEmail();

    function confirmEmail(){
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);

        var $email_address = urlParams.get('email');
        var $token = urlParams.get('token');

        $.ajax({
            type: 'POST',
            url: protocol + '//api.' + base_domain + '/v1/users/confirm-email',
            data: {
                email_address: $email_address,
                token: $token,
            },
            error: function(response) {
                var err = JSON.parse(response.responseText);
                var errorHtml = Init.generateErrorHtml(err.message);
                $('#confirmation-message').html(errorHtml);
            },
            success: function (response) {
                var $status = response.status;

                if ($status === 'success') {
                    var successHtml = Init.generateSuccessHtml(response.message);
                    $('#confirmation-message').html(successHtml);
                }
            }
        });
    }
});