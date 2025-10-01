$(document).ready(function() {
    const protocol = $(location).attr('protocol');
    const base_domain = Init.getBaseDomain();

    // Get the resource ID from the URL
    const subscription_id = Init.getIdFromUrl();

    // If the ID is present, fetch the resource details
    if (subscription_id) {
        loadSubscription(subscription_id);
    } else {
        window.location.href = './home';
    }

    // Function to handle login checks
    function loadSubscription(subscription_id) {
        const token = Init.getToken();

        $.ajax({
            type: 'GET',
            url: protocol + '//api.' + base_domain + '/v1/subscriptions/' + subscription_id,
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + token);
            },
            error: function() {
                window.location.href = './home';
            },
            success: function (response) {
                var data = response.data;

                $('#subscription-reference').html(data.uuid);
                $('#subscription-active-status').html(data.active_status.name);
                $('#subscription-plan').html(data.plan.name);
                $('#subscription-frequency').html(data.frequency.charAt(0).toUpperCase() + data.frequency.slice(1));
                $('#subscription-start-date').html(data.start_at);
                $('#subscription-end-date').html(data.end_at);
                $('#subscription-amount').html(parseFloat(data.amount).toLocaleString() + ' ' + data.currency.code);
                $('#subscription-payment-status').html(data.payment_status.charAt(0).toUpperCase() + data.payment_status.slice(1));
                $('#subscription-auto-renew').html(data.auto_renew === 1 ? "Yes" : "No");

                $('#subscription-created-date').html(new Date(data.created_at).toLocaleString('en-US', {
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
});