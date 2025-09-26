$(document).ready(function() {
    const protocol = $(location).attr('protocol');
    const base_domain = getBaseDomain();

    function getBaseDomain() {
        const hostname = $(location).attr('hostname');
        const domain_parts = hostname.split('.');
        domain_parts.shift();
        return domain_parts.join('.');
    }

    verifyPayment();

    function verifyPayment(){
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);

        var $reference = urlParams.get('reference');

        $.ajax({
            type: 'POST',
            url: protocol + '//api.' + base_domain + '/v1/payments/' + $reference + '/verify',
            error: function(response) {
                var err = JSON.parse(response.responseText);
                var errorHtml = generateErrorHtml(err.message);
                $('#verification-message').html(errorHtml);
            },
            success: function (response) {
                var $status = response.status;

                if ($status === 'success') {
                    var successHtml = generateSuccessHtml(response.message);
                    $('#verification-message').html(successHtml);
                }
            }
        });
    }

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