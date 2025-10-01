$(document).ready(function() {
    const protocol = $(location).attr('protocol');
    const base_domain = Init.getBaseDomain();

    // Get the resource ID from the URL
    const asset_id = Init.getIdFromUrl();

    // If the ID is present, fetch the resource details
    if (asset_id) {
        loadAsset(asset_id);
    } else {
        window.location.href = './home';
    }

    // Function to handle login checks
    function loadAsset(asset_id) {
        const token = Init.getToken();

        $.ajax({
            type: 'GET',
            url: protocol + '//api.' + base_domain + '/v1/assets/' + asset_id,
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + token);
            },
            error: function(response) {
                window.location.href = './home';
            },
            success: function (response) {
                var data = response.data;

                $('#asset_name').val(data.name);
                $('#asset_type').val(data.type.id);
                $('#asset_description').val(data.description);
            }
        });
    }

    $('#cancel-update-button').on('click', function() {
        window.location.href = './read-asset.html?id=' + asset_id;
    } );

    $('#update-asset-form').on('submit', function(event) {
        event.preventDefault();
        $('#message-container').html('');
        $('#submit').prop("disabled", true);

        const token = Init.getToken();

        var $asset_name = $('#asset_name').val();
        var $asset_type = $('#asset_type').val();
        var $asset_description = $('#asset_description').val();

        $.ajax({
            type: 'PATCH',
            url: protocol + '//api.' + base_domain + '/v1/assets/' + asset_id,
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + token);
            },
            data: {
                name: $asset_name,
                type_id: $asset_type,
                description: $asset_description,
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

                    window.location.href = './read-asset.html?id=' + asset_id;
                }
            }
        });
    });
});