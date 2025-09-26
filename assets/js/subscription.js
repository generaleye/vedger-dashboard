$(document).ready(function() {
    const protocol = $(location).attr('protocol');
    const base_domain = getBaseDomain();

    function getBaseDomain() {
        const hostname = $(location).attr('hostname');
        const domain_parts = hostname.split('.');
        domain_parts.shift();
        return domain_parts.join('.');
    }

    loadProfile();
    loadSubscriptions();

    function loadProfile() {
        // Retrieve token from session storage
        var token = sessionStorage.getItem('access_token');

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
                $('#subscription-plan').html(data.plan.code);

                if (data.plan.code === 'BASIC') {
                    $('#subscription-frequency').html('Monthly');
                    $('#subscription-start-at').html('Lifetime');
                    $('#subscription-end-at').html('Lifetime');
                    // $('#subscription-amount').html('0 NGN');
                    $('#subscription-auto-renew').html("Yes");

                    $(".basic").removeAttr("onclick");
                    $('.basic').prop("disabled", true);
                    $('#basic-monthly').text('Subscribed');
                    $('#basic-yearly').text('Subscribed');

                    $('#standard-monthly').text('Upgrade to Standard');
                    $('#standard-yearly').text('Upgrade to Standard');
                } else if (data.plan.code === 'STANDARD') {
                    $('#subscription-frequency').html(data.subscription.frequency.charAt(0).toUpperCase() + data.subscription.frequency.slice(1).toLowerCase());
                    $('#subscription-start-at').html(data.subscription.start_at);
                    $('#subscription-end-at').html(data.subscription.end_at);
                    // $('#subscription-amount').html(data.subscription.amount + " NGN");
                    $('#subscription-auto-renew').html(data.subscription.auto_renew === 1 ? "Yes" : "No");

                    $('#basic-monthly').text('Downgrade');
                    $('#basic-yearly').text('Downgrade');

                    $(".standard").removeAttr("onclick");
                    $('.standard').prop("disabled", true);
                    $('#standard-monthly').text('Subscribed');
                    $('#standard-yearly').text('Subscribed');
                }
            }
        });
    }

    $(function(){
        $(".standard").click(function(){
            var $selected = $(this).attr('id');
            var $frequency = 'monthly';
            if ($selected === 'standard-yearly') {
                $frequency = 'yearly';
            }

            var token = sessionStorage.getItem('access_token');
            $.ajax({
                type: 'POST',
                url: protocol + '//api.' + base_domain + '/v1/subscriptions',
                beforeSend: function(xhr) {
                    xhr.setRequestHeader('Authorization', 'Bearer ' + token);
                },
                data: {
                    plan_pricing_id: 1,
                    frequency: $frequency
                },
                error: function(response) {
                    var err = JSON.parse(response.responseText);
                    var errorHtml = generateErrorHtml(err.message);
                    $('#message-container').html(errorHtml);
                },
                success: function (response) {
                    var $status = response.status;

                    if ($status === 'success') {
                        var successHtml = generateSuccessHtml(response.message);
                        $('#message-container').html(successHtml);
                        var data = response.data;

                        $('#subscription_uuid').val(data.uuid);
                        $('#create_subscription_reference').val(data.uuid);
                        $('#create_subscription_plan').val(data.plan.name);
                        $('#create_subscription_frequency').val(data.frequency.charAt(0).toUpperCase() + data.frequency.slice(1).toLowerCase());
                        $('#create_subscription_start_date').val(data.start_at);
                        $('#create_subscription_end_date').val(data.end_at);
                        $('#create_subscription_amount').val(data.amount + ' ' + data.currency.code);

                        $("#createSubscriptionModal").modal("show");
                        // window.location.href = './read-envelope.html?id='+response.data.uuid;
                    }
                }
            });


        });
    });

    $('#create-subscription').on('submit', function( event ) {
        event.preventDefault();
        $('#create-subscription-message-container').html('');
        $('#pay').prop("disabled", true);

        var $subscription_uuid = $('#subscription_uuid').val();

        var token = sessionStorage.getItem('access_token');
        $.ajax({
            type: 'POST',
            url: protocol + '//api.' + base_domain + '/v1/subscriptions/' + $subscription_uuid + '/pay',
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + token);
            },
            error: function(response) {
                var err = JSON.parse(response.responseText);
                var errorHtml = generateErrorHtml(err.message);
                $('#create-subscription-message-container').html(errorHtml);
                $('#pay').prop("disabled", false);
            },
            success: function (response) {
                var $status = response.status;

                if ($status === 'success') {
                    var successHtml = generateSuccessHtml(response.message);
                    $('#create-subscription-message-container').html(successHtml);

                    window.location.href = response.data.payment_link;
                }
            }
        });
    });

    function loadSubscriptions() {
        // Retrieve token from session storage
        var token = sessionStorage.getItem('access_token');

        $.ajax({
            type: 'GET',
            url: protocol + '//api.' + base_domain + '/v1/subscriptions',
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + token);
            },
            error: function(response) {
                var err = JSON.parse(response.responseText);
                var errorHtml = generateErrorHtml(err.message);
                $('#message-container').html(errorHtml);
            },
            success: function (response) {
                $('#subscription-container').html('');

                var data = response.data;

                if (data.length === 0) {
                    var $subscription_row = $('<tr>');
                    $subscription_row.append($('<td>').addClass('text-center').attr('colspan', 8)
                        .html('No Data Available')
                    );

                    $('#subscription-container').append($subscription_row);
                }

                $.each(data, function (key) {
                    var creaatedWithoutZ= data[key].created_at.substring(0,data[key].created_at.length-1);
                    var createdWithoutZDate= new Date(creaatedWithoutZ);

                    var $subscription_row = $('<tr>');
                    $subscription_row.append($('<td>').html(data[key].plan.name));
                    $subscription_row.append($('<td>').html(data[key].frequency.charAt(0).toUpperCase() + data[key].frequency.slice(1).toLowerCase()));
                    $subscription_row.append($('<td>').html(data[key].start_at));
                    $subscription_row.append($('<td>').html(data[key].end_at));
                    $subscription_row.append($('<td>').html(parseFloat(data[key].amount).toLocaleString() + ' ' + data[key].currency.code ?? '-'));
                    $subscription_row.append($('<td>').html(data[key].payment_status.charAt(0).toUpperCase() + data[key].payment_status.slice(1)));
                    $subscription_row.append($('<td>').html(createdWithoutZDate.toLocaleDateString() + ' <span class="text-muted text-sm d-block">' + createdWithoutZDate.toLocaleTimeString() + '</span>'));
                    $subscription_row.append($('<td>').addClass('text-end')
                        .html(
                            '<a class="avtar avtar-xs btn-link-secondary" href="read-subscription.html?id=' + data[key].uuid + '"><i class="ti ti-eye f-20"></i></a>'
                        )
                    );

                    $('#subscription-container').append($subscription_row);
                });
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

function downgrade() {
    alert('Your plan will not auto renew');
}
