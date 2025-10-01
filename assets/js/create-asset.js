$(document).ready(function() {
    const protocol = $(location).attr('protocol');
    const base_domain = Init.getBaseDomain();

    loadProfile();
    loadCurrencies();

    $('#create-asset-form').on('submit', function(event) {
        event.preventDefault();
        $('#message-container').html('');
        $('#submit').prop("disabled", true);

        const token = Init.getToken();

        var $asset_name = $('#asset_name').val();
        var $asset_type = $('#asset_type').val();
        var $asset_description = $('#asset_description').val();
        var $value = parseFloat($('#value').val()).toFixed(2);
        var $currency_id = $('#asset_currency').val();

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
                value: $value,
                currency_id: $currency_id,
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

                    window.location.href = './read-asset.html?id='+response.data.uuid;
                }
            }
        });
    });

    function loadProfile() {
        const token = Init.getToken();

        $.ajax({
            type: 'GET',
            url: protocol + '//api.' + base_domain + '/v1/users/profile',
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + token);
            },
            error: function() {
                window.location.href = './home';
            },
            success: function (response) {
                var data = response.data;

                $('#asset_currency').val(data.preferred_currency.id);
            }
        });
    }

    function loadCurrencies() {
        $.ajax({
            type: 'GET',
            url: protocol + '//api.' + base_domain + '/v1/utilities/currencies',
            error: function(response) {
            },
            success: function (response) {
                var data = response.data;

                var asset_currency = $('#asset_currency');

                $.each(data, function (key) {
                    var $currency_option = $('<option>').html(data[key].code + ' - ' + data[key].full_name).val(data[key].id);
                    asset_currency.append($currency_option);
                });
            }
        });
    }
});