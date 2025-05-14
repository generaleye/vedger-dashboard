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
    const envelope_id = getIdFromUrl();

    // If the ID is present, fetch the resource details
    if (envelope_id) {
        loadEnvelope(envelope_id);
    } else {
        window.location.href = './envelopes';
    }

    // Function to get the ID from the URL
    function getIdFromUrl() {
        const urlParams= new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    // Function to load envelope
    function loadEnvelope(envelope_id) {
        // Retrieve token from session storage
        var token = sessionStorage.getItem('access_token');

        $.ajax({
            type: 'GET',
            url: protocol + '//api.' + base_domain + '/v1/envelopes/' + envelope_id,
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + token);
            },
            error: function(response) {
                window.location.href = './envelopes';
            },
            success: function (response) {
                var data = response.data;

                $('#envelope_title').val(data.title);
                $('#envelope_description').val(data.description);
            }
        });
    }

    $('#cancel-update-button').on('click', function() {
        window.location.href = './read-envelope.html?id=' + envelope_id;
    } );

    $('#update-envelope-form').on('submit', function(event) {
        event.preventDefault();
        $('#message-container').html('');
        $('#submit').prop("disabled", true);

        var $envelope_title = $('#envelope_title').val();
        var $envelope_description = $('#envelope_description').val();

        var token = sessionStorage.getItem('access_token');

        $.ajax({
            type: 'PATCH',
            url: protocol + '//api.' + base_domain + '/v1/envelopes/' + envelope_id,
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + token);
            },
            data: {
                title: $envelope_title,
                description: $envelope_description,
            },
            error: function(response) {
                var err = JSON.parse(response.responseText);
                var errorHtml = generateErrorHtml(err.message);
                $('#message-container').html(errorHtml);
                $('#submit').prop("disabled", false);
            },
            success: function (response) {
                var $status = response.status;

                if ($status === 'success') {
                    var successHtml = generateSuccessHtml(response.message);
                    $('#message-container').html(successHtml);

                    window.location.href = './read-envelope.html?id=' + envelope_id;
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