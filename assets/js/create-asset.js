$(document).ready(function() {
    const protocol = $(location).attr('protocol');
    const base_domain = getBaseDomain();

    function getBaseDomain() {
        const hostname = $(location).attr('hostname');
        const domain_parts = hostname.split('.');
        domain_parts.shift();
        return domain_parts.join('.');
    }

    $('#create-asset-form').on('submit', function(event) {
        event.preventDefault();
        var $asset_name = $('#asset_name').val();
        var $asset_type = $('#asset_type').val();
        var $asset_description = $('#asset_description').val();
        var $monetary_value = parseFloat($('#monetary_value').val()).toFixed(2);
        var $currency_id = $('#currency_id').val();

        var token = sessionStorage.getItem('access_token');

        $.ajax({
            type: 'POST',
            url: protocol + '//api.' + base_domain + '/v1/assets',
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + token);
            },
            data: {
                name: $asset_name,
                type_id: $asset_type,
                description: $asset_description,
                monetary_value: $monetary_value,
                currency_id: $currency_id,
            },
            error: function(response) {
                var err = JSON.parse(response.responseText);
                var errorHtml = generateErrorHtml(err.message);
                $('#message-container').html(errorHtml);
            },
            success: function (response) {
                var $status = response.status;

                if ($status === 'success') {
                    window.location.href = './read-asset.html?id='+response.data.uuid;
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