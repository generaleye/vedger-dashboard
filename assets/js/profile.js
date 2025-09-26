$(document).ready(function() {
    const protocol = $(location).attr('protocol');
    const base_domain = getBaseDomain();

    function getBaseDomain() {
        const hostname = $(location).attr('hostname');
        const domain_parts = hostname.split('.');
        domain_parts.shift();
        return domain_parts.join('.');
    }

    loadCurrencies();

    loadProfile();

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

                $('#profile-name').html(data.full_name);
                $('#profile-email').html(data.email_address);

                $('#profile-no-of-assets').html(data.no_of_assets);
                $('#profile-net-worth').html(parseFloat(data.net_worth).toLocaleString() + ' ' + data.preferred_currency.code);
                $('#profile-no-of-contacts').html(data.no_of_contacts);
                $('#profile-no-of-envelopes').html(data.no_of_envelopes);

                $('.profile-first-name').html(data.first_name).val(data.first_name);
                $('.profile-last-name').html(data.last_name).val(data.last_name);
                $('.profile-phone-number').html(data.phone_number).val(data.phone_number);
                $('.profile-email-address').html(data.email_address).val(data.email_address);

                $('.profile-preferred-currency').html(data.preferred_currency.code);
                $('#update-profile-preferred-currency').val(data.preferred_currency.id);
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

                var update_profile_preferred_currency = $('#update-profile-preferred-currency');

                $.each(data, function (key) {
                    var $currency_option = $('<option>').html(data[key].code + ' - ' + data[key].full_name).val(data[key].id);
                    update_profile_preferred_currency.append($currency_option);
                });
            }
        });
    }

    $('#update-profile-form').on('submit', function(event) {
        event.preventDefault();
        $('#message-container').html('');
        $('#submit').prop("disabled", true);

        var $first_name = $('#update-profile-first-name').val();
        var $last_name = $('#update-profile-last-name').val();
        var $phone_number = $('#update-profile-phone-number').val();
        var $country_id = $('#country_id').val();
        var $currency_id = $('#update-profile-preferred-currency').val();

        var token = sessionStorage.getItem('access_token');

        $.ajax({
            type: 'PATCH',
            url: protocol + '//api.' + base_domain + '/v1/users/profile',
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + token);
            },
            data: {
                first_name: $first_name,
                last_name: $last_name,
                phone_number: $phone_number,
                country_id: $country_id,
                currency_id: $currency_id
            },
            error: function(response) {
                var err = JSON.parse(response.responseText);
                var errorHtml = generateErrorHtml(err.message);
                $('#message-container').html(errorHtml);
                $('#submit').prop("disabled", false);
            },
            success: function (response) {
                var status = response.status;

                if (status === 'success') {
                    var successHtml = generateSuccessHtml(response.message);
                    $('#message-container').html(successHtml);

                    window.location.href = './profile';
                }
            }
        });
    });

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