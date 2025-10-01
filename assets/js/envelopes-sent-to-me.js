$(document).ready(function() {
    const protocol = $(location).attr('protocol');
    const base_domain = Init.getBaseDomain();

    // Call the check login function when the page is loaded
    loadEnvelopesSentToMe();

    // Function to handle loading envelopes
    function loadEnvelopesSentToMe() {
        const token = Init.getToken();

        $.ajax({
            type: 'GET',
            url: protocol + '//api.' + base_domain + '/v1/envelopes/sent-to-me',
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + token);
            },
            error: function(response) {
                var err = JSON.parse(response.responseText);
                var errorHtml = Init.generateErrorHtml(err.message);
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
                    var sentAt= new Date(data[key].sent_at);

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
                    $envelope_row.append($('<td>').html(sentAt.toLocaleDateString() + ' <span class="text-muted text-sm d-block">' + sentAt.toLocaleTimeString() + '</span>'));
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
});