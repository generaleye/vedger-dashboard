$(document).ready(function() {
    const protocol = $(location).attr('protocol');
    const hostname = $(location).attr('hostname');
    const domain_parts = hostname.split('.');
    domain_parts.shift();
    const base_domain = domain_parts.join('.');

    // Function to handle login checks
    function checkLogin() {
        // Retrieve token from session storage
        var token = sessionStorage.getItem('access_token');
        if (!token) {
            console.log('No token found.');
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
                console.log('login-check: failed')
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
                    $('#overview-net-worth').html(parseFloat(response.data.net_worth).toLocaleString());
                }
            }
        });
    }

    // Call the check login function when the page is loaded
    checkLogin();
});