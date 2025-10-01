$(document).ready(function() {
    const protocol = $(location).attr('protocol');
    const base_domain = Init.getBaseDomain();

    // Call the check login function when the page is loaded
    checkLogin();
    updateLastSeen();

    // Function to handle login checks
    function checkLogin() {
        const token = Init.getToken();
        if (!token) {
            // Redirect to login page
            window.location.href = './account/login';
        }

        $.ajax({
            type: 'GET',
            url: protocol + '//api.' + base_domain + '/v1/users/profile',
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + token);
            },
            error: function(response) {
                sessionStorage.clear();
                // Redirect to login page
                window.location.href = './account/login';
            },
            success: function (response) {
                $('#nav-profile-name').html(response.data.full_name);
                $('#nav-profile-email').html(response.data.email_address);

                if ($('#overview-no-of-assets').length) {
                    $('#overview-no-of-assets').html(response.data.no_of_assets);
                }
                if ($('#overview-net-worth').length) {
                    $('#overview-net-worth').html(parseFloat(response.data.net_worth).toLocaleString() + ' ' + response.data.preferred_currency.code);
                }
            }
        });
    }

    // Function to update last seen at date
    function updateLastSeen() {
        const token = Init.getToken();
        if (!token) {
            // Redirect to login page
            window.location.href = './account/login';
        }

        $.ajax({
            type: 'POST',
            url: protocol + '//api.' + base_domain + '/v1/users/last-seen-at',
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + token);
            },
            error: function() {
                Init.clearToken();
                // Redirect to login page
                window.location.href = './account/login';
            }
        });
    }
});