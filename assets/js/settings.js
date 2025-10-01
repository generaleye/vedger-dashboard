$(document).ready(function() {
    const protocol = $(location).attr('protocol');
    const base_domain = Init.getBaseDomain();

    $('#change-password-form').on('submit', function(event) {
        event.preventDefault();
        $('#message-container').html('');
        $('#submit').prop("disabled", true);

        const token = Init.getToken();

        var $old_password = $('#old_password').val();
        var $new_password = $('#new_password').val();
        var $new_password_confirmation = $('#new_password_confirmation').val();

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
                var errorHtml = Init.generateErrorHtml(err.message);
                $('#message-container').html(errorHtml);
                $('#submit').prop("disabled", false);
            },
            success: function (response) {
                var $status = response.status;

                var successHtml = Init.generateSuccessHtml(response.message);
                $('#message-container').html(successHtml);
            }
        });
    });
});