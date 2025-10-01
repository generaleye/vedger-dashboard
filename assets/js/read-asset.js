$(document).ready(function() {
    const protocol = $(location).attr('protocol');
    const base_domain = Init.getBaseDomain();

    // Get the resource ID from the URL
    const asset_id = Init.getIdFromUrl();

    // If the ID is present, fetch the resource details
    if (asset_id) {
        loadAsset(asset_id);
        loadAssetValuations(asset_id);
    } else {
        window.location.href = './home';
    }

    $('#asset-update-button').on('click', function() {
        window.location.href = './update-asset.html?id=' + asset_id;
    });

    $('#asset-delete-button').on('click', function() {
        var confirm_delete = confirm('Are you sure you want to delete this asset?');
        if(confirm_delete){
            const token = Init.getToken();
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
    } );

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

                $('#asset-name').html(data.name);
                $('#asset-type').html(data.type.name);
                $('#asset-description').html(data.description);
                $('#asset-current-value').html(parseFloat(data.current_value).toLocaleString() + ' ' + data.currency.code ?? '-').prop('title', parseFloat(data.preferred_current_value).toLocaleString() + ' ' + data.preferred_currency.code);
                $('#asset-initial-value').html(parseFloat(data.initial_value).toLocaleString() + ' ' + data.currency.code ?? '-');

                $('#asset-creator').html(data.creator.first_name + ' ' + data.creator.last_name);
                $('#asset-created-date').html(new Date(data.created_at).toLocaleString('en-US', {
                    year: 'numeric',
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    second: 'numeric',
                    hour12: false,
                }));
            }
        });
    }

    function loadAssetValuations(asset_id) {
        const token = Init.getToken();

        $.ajax({
            type: 'GET',
            url: protocol + '//api.' + base_domain + '/v1/assets/' + asset_id + '/valuations',
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + token);
            },
            error: function(response) {
                window.location.href = './home';
            },
            success: function (response) {
                var data = response.data;
                if (data.length === 0) {
                    var $asset_valuation_row = $('<tr>');
                    $asset_valuation_row.append($('<td>').addClass('text-center').attr('colspan', 4)
                        .html('No Data Available')
                    );

                    $('#asset-valuation-container').append($asset_valuation_row);
                }

                const chart_valuation_data_y_axis = [];
                const chart_valuation_date_x_axis = [];

                $.each(data, function (key, value) {
                    var valuatedAt= new Date(data[key].valuated_at);

                    var $asset_valuation_row = $('<tr>');
                    $asset_valuation_row.append($('<td>').html(parseFloat(data[key].value).toLocaleString() + ' ' + data[key].currency.code ?? '-'));
                    $asset_valuation_row.append($('<td>').html(valuatedAt.toLocaleDateString() + ' <span class="text-muted text-sm d-block">' + valuatedAt.toLocaleTimeString() + '</span>'));
                    if (data[key].note == null) {
                        $asset_valuation_row.append($('<td>').html('-'));
                    } else if (data[key].note.length > 80) {
                        $asset_valuation_row.append($('<td>').html(data[key].note.substring(0, 75) + ' ...'));
                    } else {
                        $asset_valuation_row.append($('<td>').html(data[key].note));
                    }
                    $asset_valuation_row.append($('<td>').html(data[key].creator.first_name + ' ' + data[key].creator.last_name));
                    $asset_valuation_row.append($('<td>').addClass('text-end')
                        .html(
                            '<a class="avtar avtar-xs btn-link-secondary update-asset-value" id="' + data[key].id + '" href="#" data-bs-toggle="modal" data-bs-target="#updateAssetValueModal"><i class="ti ti-edit f-20"></i></a>'+
                            '<a class="avtar avtar-xs btn-link-secondary delete-asset-value" id="' + data[key].id + '" href="#"><i class="ti ti-thrash f-20"></i></a>'
                        )
                    );

                    $('#asset-valuation-container').append($asset_valuation_row);

                    chart_valuation_data_y_axis.push(data[key].value);
                    chart_valuation_date_x_axis.push(data[key].valuated_at.substring(0, 16).replace('T', ' '));
                });

                var options = {
                    series: [{
                        name: 'Valuation',
                        data: chart_valuation_data_y_axis.reverse()
                    }],
                    chart: {
                        height: 350,
                        type: 'line',
                        zoom: {
                            enabled: false
                        }
                    },
                    dataLabels: {
                        enabled: false
                    },
                    stroke: {
                        curve: 'straight'
                    },
                    grid: {
                        row: {
                            colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
                            opacity: 0.5
                        },
                    },
                    xaxis: {
                        categories: chart_valuation_date_x_axis.reverse(),
                    }
                };

                var chart = new ApexCharts(document.querySelector('#line-chart-1'), options);
                chart.render();
            }
        });
    }

    $('#add-asset-value').on('submit', function(event) {
        event.preventDefault();
        $('#add-value-message-container').html('');
        $('#submit').prop("disabled", true);

        const token = Init.getToken();

        var $add_value = parseFloat($('#add_value').val()).toFixed(2);
        var $add_value_date = $('#add_value_date').val();
        var $add_note = $('#add_note').val();
        var $currency_id = $('#currency_id').val();

        $.ajax({
            type: 'POST',
            url: protocol + '//api.' + base_domain + '/v1/assets/' + asset_id + '/valuations',
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + token);
            },
            data: {
                value: $add_value,
                valuated_at: $add_value_date,
                note: $add_note,
                currency_id: $currency_id,
            },
            error: function(response) {
                var err = JSON.parse(response.responseText);
                var errorHtml = Init.generateErrorHtml(err.message);
                $('#add-value-message-container').html(errorHtml);
                $('#submit').prop("disabled", false);
            },
            success: function (response) {
                var $status = response.status;

                if ($status === 'success') {
                    var successHtml = Init.generateSuccessHtml(response.message);
                    $('#add-value-message-container').html(successHtml);

                    window.location.href = './read-asset.html?id=' + asset_id;
                }
            }
        });
    });

    $('#update-asset-value').on('submit', function( event ) {
        event.preventDefault();
        $('#update-value-message-container').html('');
        $('#update').prop("disabled", true);

        const token = Init.getToken();

        var $update_value = parseFloat($('#update_value').val()).toFixed(2);
        var $update_value_date = $('#update_value_date').val();
        var $update_note = $('#update_note').val();
        var $currency_id = $('#currency_id_update').val();
        var $valuation_id = $('#valuation_id').val();

        $.ajax({
            type: 'PATCH',
            url: protocol + '//api.' + base_domain + '/v1/assets/' + asset_id + '/valuations/' + $valuation_id,
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + token);
            },
            data: {
                value: $update_value,
                valuated_at: $update_value_date,
                note: $update_note,
                currency_id: $currency_id,
            },
            error: function(response) {
                var err = JSON.parse(response.responseText);
                var errorHtml = Init.generateErrorHtml(err.message);
                $('#update-value-message-container').html(errorHtml);
                $('#update').prop("disabled", false);
            },
            success: function (response) {
                var $status = response.status;

                if ($status === 'success') {
                    var successHtml = Init.generateSuccessHtml(response.message);
                    $('#update-value-message-container').html(successHtml);

                    window.location.href = './read-asset.html?id=' + asset_id;
                }
            }
        });
    });

    $(document).on('click', '#addAssetValueModalButton', function () {
        var now= new Date();
        const currentDateISOWithoutZDateLocal = new Date(now.getTime()-now.getTimezoneOffset()*60000).toISOString().substring(0,16);
        $('#add_value_date').val(currentDateISOWithoutZDateLocal).attr('max', currentDateISOWithoutZDateLocal);
    });

    $(document).on('click', '.update-asset-value', function () {
        const token = Init.getToken();
        var valuation_id = this.id;

        $.ajax({
            type: 'GET',
            url: protocol + '//api.' + base_domain + '/v1/assets/' + asset_id + '/valuations/' + valuation_id,
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + token);
            },
            success: function (response) {
                var $status = response.status;

                if ($status === 'success') {
                    var data = response.data;
                    var valuatedAt = new Date(data.valuated_at);
                    // Format Date object to HTML datetime-local string
                    const pad = (num) => String(num).padStart(2, '0');
                    const htmlDateTimeLocal = `${valuatedAt.getFullYear()}-${pad(valuatedAt.getMonth() + 1)}-${pad(valuatedAt.getDate())}T${pad(valuatedAt.getHours())}:${pad(valuatedAt.getMinutes())}`;

                    $('#update_value').val(data.value);
                    $('#update_note').val(data.note);
                    $('#update_value_date').val(htmlDateTimeLocal);

                    var now= new Date();
                    const currentDateISOWithoutZDateLocal = new Date(now.getTime()-now.getTimezoneOffset()*60000).toISOString().substring(0,19);
                    $('#update_value_date').attr('max', currentDateISOWithoutZDateLocal);

                    $('#valuation_id').val(valuation_id);
                }
            }
        });
    });

    $(document).on('click', '.delete-asset-value', function () {
        var confirm_delete = confirm('Are you sure you want to delete this asset valuation?');
        if(confirm_delete){
            const token = Init.getToken();
            var valuation_id = this.id;
            $.ajax({
                type: 'DELETE',
                url: protocol + '//api.' + base_domain + '/v1/assets/' + asset_id + '/valuations/' + valuation_id,
                beforeSend: function(xhr) {
                    xhr.setRequestHeader('Authorization', 'Bearer ' + token);
                },
                success: function (response) {
                    var $status = response.status;

                    if ($status === 'success') {
                        window.location.href = './read-asset.html?id=' + asset_id;
                    }
                }
            });
        }
    });
});