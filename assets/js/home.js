$(document).ready(function() {
    const protocol = $(location).attr('protocol');
    const base_domain = getBaseDomain();

    function getBaseDomain() {
        const hostname = $(location).attr('hostname');
        const domain_parts = hostname.split('.');
        domain_parts.shift();
        return domain_parts.join('.');
    }

    // Function to handle login checks
    function loadAssets() {
        // Retrieve token from session storage
        var token = sessionStorage.getItem('access_token');

        $.ajax({
            type: 'GET',
            url: protocol + '//api.' + base_domain + '/v1/assets',
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + token);
            },
            error: function(response) {
                var err = JSON.parse(response.responseText);
                var errorHtml = generateErrorHtml(err.message);
                $('#message-container').html(errorHtml);
            },
            success: function (response) {
                $('#asset-container').html('');

                var data = response.data;

                if (data.length === 0) {
                    var $asset_row = $('<tr>');
                    $asset_row.append($('<td>').addClass('text-center').attr('colspan', 5)
                        .html('No Data Available')
                    );

                    $('#asset-container').append($asset_row);
                }

                // var asset_row = $('<tr>');
                $.each(data, function (key, value) {
                    var valuatedWithoutZ= data[key].created_at.substring(0,data[key].created_at.length-1);
                    var valuatedWithoutZDate= new Date(valuatedWithoutZ);

                    var $asset_row = $('<tr>');
                    $asset_row.append($('<td>').html(data[key].name));
                    $asset_row.append($('<td>').html(data[key].type.name));
                    $asset_row.append($('<td>').html(parseFloat(data[key].current_value).toLocaleString() + ' ' + data[key].currency.code ?? '-').prop('title', parseFloat(data[key].preferred_current_value).toLocaleString() + ' ' + data[key].preferred_currency.code));
                    $asset_row.append($('<td>').html(valuatedWithoutZDate.toLocaleDateString() + ' <span class="text-muted text-sm d-block">' + valuatedWithoutZDate.toLocaleTimeString() + '</span>'));
                    if (data[key].description.length > 80) {
                        $asset_row.append($('<td>').html(data[key].description.substring(0, 75) + ' ...'));
                    } else {
                        $asset_row.append($('<td>').html(data[key].description));
                    }
                    $asset_row.append($('<td>').addClass('text-end')
                        .html(
                            '<a class="avtar avtar-xs btn-link-secondary" href="read-asset.html?id=' + data[key].uuid + '"><i class="ti ti-eye f-20"></i></a>' +
                            '<a class="avtar avtar-xs btn-link-secondary" href="update-asset.html?id=' + data[key].uuid + '"><i class="ti ti-edit f-20"></i></a>' +
                            '<a class="avtar avtar-xs btn-link-secondary delete-asset" id="' + data[key].uuid + '" href="#"><i class="ti ti-thrash f-20"></i></a>'
                        )
                    );

                    $('#asset-container').append($asset_row);
                });
            }
        });
    }

    // Call the check login function when the page is loaded
    loadAssets();


    $(document).on('click', '.delete-asset', function () {
        var confirm_delete = confirm('Are you sure you want to delete this asset?');
        if(confirm_delete){
            var token = sessionStorage.getItem('access_token');
            var asset_id = this.id;

            $.ajax({
                type: 'DELETE',
                url: protocol + '//api.' + base_domain + '/v1/assets/' + asset_id,
                beforeSend: function(xhr) {
                    xhr.setRequestHeader('Authorization', 'Bearer ' + token);
                },
                success: function (response) {
                    var $status = response.status;

                    if ($status === 'success') {
                        window.location.href = './home';
                    }
                }
            });
        }
    });
});