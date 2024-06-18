$(document).ready(function() {
    const protocol = $(location).attr('protocol');
    const base_domain = getBaseDomain();

    function getBaseDomain() {
        const hostname = $(location).attr('hostname');
        const domain_parts = hostname.split('.');
        domain_parts.shift();
        return domain_parts.join('.');
    }

    // Get the resource ID from the URL
    const asset_id = getIdFromUrl();

    // If the ID is present, fetch the resource details
    if (asset_id) {
        loadAsset(asset_id);
    } else {
        window.location.href = './home';
    }

    // Function to get the ID from the URL
    function getIdFromUrl() {
        const urlParams= new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    // Function to handle login checks
    function loadAsset(asset_id) {
        // Retrieve token from session storage
        var token = sessionStorage.getItem('access_token');

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

        var $asset_name = $('#asset_name').val();
        var $asset_type = $('#asset_type').val();
        var $asset_description = $('#asset_description').val();

        var token = sessionStorage.getItem('access_token');

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
                var errorHtml = generateErrorHtml(err.message);
                $('#message-container').html(errorHtml);
            },
            success: function (response) {
                var $status = response.status;

                if ($status === 'success') {
                    window.location.href = './read-asset.html?id=' + asset_id;
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