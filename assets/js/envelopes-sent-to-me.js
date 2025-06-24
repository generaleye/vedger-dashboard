$(document).ready(function() {
    const protocol = $(location).attr('protocol');
    const base_domain = getBaseDomain();

    function getBaseDomain() {
        const hostname = $(location).attr('hostname');
        const domain_parts = hostname.split('.');
        domain_parts.shift();
        return domain_parts.join('.');
    }

    // Function to handle loading envelopes
    function loadEnvelopesSentToMe() {
        // Retrieve token from session storage
        var token = sessionStorage.getItem('access_token');

        $.ajax({
            type: 'GET',
            url: protocol + '//api.' + base_domain + '/v1/envelopes/sent-to-me',
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + token);
            },
            error: function(response) {
                var err = JSON.parse(response.responseText);
                var errorHtml = generateErrorHtml(err.message);
                $('#message-container').html(errorHtml);
            },
            success: function (response) {
                $('#envelope-container').html('');

                var data = response.data;

                if (data.length === 0) {
                    var $envelope_row = $('<tr>');
                    $envelope_row.append($('<td>').addClass('text-center').attr('colspan', 5)
                        .html('No Data Available')
                    );

                    $('#envelope-container').append($envelope_row);
                }

                $.each(data, function (key) {
                    var sentAtWithoutZ= data[key].sent_at.substring(0,data[key].sent_at.length-1);
                    var sentWithoutZDate= new Date(sentAtWithoutZ);

                    var $envelope_row = $('<tr>');
                    if (data[key].title.length > 40) {
                        $envelope_row.append($('<td>').html(data[key].title.substring(0, 35) + ' ...'));
                    } else {
                        $envelope_row.append($('<td>').html(data[key].title));
                    }
                    if (data[key].description.length > 40) {
                        $envelope_row.append($('<td>').html(data[key].description.substring(0, 35) + ' ...'));
                    } else {
                        $envelope_row.append($('<td>').html(data[key].description));
                    }
                    $envelope_row.append($('<td>').html(data[key].created_by));
                    $envelope_row.append($('<td>').html(sentWithoutZDate.toLocaleDateString() + ' <span class="text-muted text-sm d-block">' + sentWithoutZDate.toLocaleTimeString() + '</span>'));
                    $envelope_row.append($('<td>').addClass('text-end')
                        .html(
                            '<a class="avtar avtar-xs btn-link-secondary" href="read-envelope-sent-to-me.html?id=' + data[key].uuid + '"><i class="ti ti-eye f-20"></i></a>'
                        )
                    );

                    $('#envelope-container').append($envelope_row);
                });
            }
        });
    }

    // Call the check login function when the page is loaded
    loadEnvelopesSentToMe();

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