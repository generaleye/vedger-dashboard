$(document).ready(function() {
    const protocol = $(location).attr('protocol');
    const base_domain = Init.getBaseDomain();

    verifyPayment();

    function verifyPayment(){
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);

        var reference = urlParams.get('reference');

        $.ajax({
            type: 'POST',
            url: protocol + '//api.' + base_domain + '/v1/payments/' + reference + '/verify',
            error: function(response) {
                var err = JSON.parse(response.responseText);
                var errorHtml = Init.generateErrorHtml(err.message);
                $('#verification-message').html(errorHtml);
            },
            success: function (response) {
                var status = response.status;

                if (status === 'success') {
                    var successHtml = Init.generateSuccessHtml(response.message);
                    $('#verification-message').html(successHtml);
                }
            }
        });
    }
});