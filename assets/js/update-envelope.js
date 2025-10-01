$(document).ready(function() {
    const protocol = $(location).attr('protocol');
    const base_domain = Init.getBaseDomain();

    // Get the resource ID from the URL
    const envelope_id = Init.getIdFromUrl();

    // If the ID is present, fetch the resource details
    if (envelope_id) {
        loadEnvelope(envelope_id);
        frequencyChangeListener();
        switchListener();
    } else {
        window.location.href = './envelopes';
    }

    // Function to load envelope
    function loadEnvelope(envelope_id) {
        const token = Init.getToken();

        $.ajax({
            type: 'GET',
            url: protocol + '//api.' + base_domain + '/v1/envelopes/' + envelope_id,
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + token);
            },
            error: function() {
                window.location.href = './envelopes';
            },
            success: function (response) {
                var data = response.data;

                var scheduledSendAt = new Date(data.scheduled_send_at);
                // Format Date object to HTML datetime-local string
                const pad = (num) => String(num).padStart(2, '0');
                const htmlDateTimeLocal = `${scheduledSendAt.getFullYear()}-${pad(scheduledSendAt.getMonth() + 1)}-${pad(scheduledSendAt.getDate())}T${pad(scheduledSendAt.getHours())}:${pad(scheduledSendAt.getMinutes())}`;

                $('#envelope_title').val(data.title);
                $('#envelope_description').val(data.description);
                $('#envelope_frequency').val(data.alert_frequency);
                $('#scheduled_send_date').val(htmlDateTimeLocal).prop( "disabled", true );

                if (data.alert_frequency === "once") {
                    $('#scheduled_send_date').prop( "disabled", false );
                }

                if (data.reminder_status === "enabled") {
                    $('#envelope_reminder_alert').prop('checked', true);
                    $('#envelope_reminder_alert_label').html('Reminder Alerts Enabled');
                } else {
                    $('#envelope_reminder_alert').prop('checked', false);
                    $('#envelope_reminder_alert_label').html('Reminder Alerts Disabled');
                }

                if (data.delivery_report === "enabled") {
                    $('#envelope_delivery_report').prop('checked', true);
                    $('#envelope_delivery_report_label').html('Delivery Report Enabled');
                } else {
                    $('#envelope_delivery_report').prop('checked', false);
                    $('#envelope_delivery_report_label').html('Delivery Report Disabled');
                }

                var now= new Date();
                const currentDateISOWithoutZDateLocal = new Date(now.getTime()-now.getTimezoneOffset()*60000).toISOString().substring(0,16);
                $('#scheduled_send_date').attr('min', currentDateISOWithoutZDateLocal);
            }
        });
    }

    function frequencyChangeListener() {
        $('#envelope_frequency').change(
            function(){
                var now= new Date();
                var days = 1;
                if ($(this).val() === 'once') {
                    days = 1;
                    $( "#scheduled_send_date" ).prop( "disabled", false );
                } else if ($(this).val() === 'monthly') {
                    days = 30;
                    $( "#scheduled_send_date" ).prop( "disabled", true );
                } else if ($(this).val() === 'quarterly') {
                    days = 90;
                    $( "#scheduled_send_date" ).prop( "disabled", true );
                } else if ($(this).val() === 'yearly') {
                    days = 365;
                    $( "#scheduled_send_date" ).prop( "disabled", true );
                }

                let currentDateISOWithoutZDateLocal = new Date(now.getTime()-now.getTimezoneOffset()*60000);
                currentDateISOWithoutZDateLocal.setDate(currentDateISOWithoutZDateLocal.getDate() + days)
                currentDateISOWithoutZDateLocal = currentDateISOWithoutZDateLocal.toISOString().substring(0,16);
                $('#scheduled_send_date').val(currentDateISOWithoutZDateLocal).attr('min', currentDateISOWithoutZDateLocal);
            }
        );
    }

    function switchListener() {
        $('#envelope_reminder_alert').change(
            function(){
                if ($(this).is(':checked')) {
                    $('#envelope_reminder_alert_label').html('Reminder Alerts Enabled');
                } else {
                    $('#envelope_reminder_alert_label').html('Reminder Alerts Disabled');
                }
            }
        );

        $('#envelope_delivery_report').change(
            function(){
                if ($(this).is(':checked')) {
                    $('#envelope_delivery_report_label').html('Delivery Report Enabled');
                } else {
                    $('#envelope_delivery_report_label').html('Delivery Report Disabled');
                }
            }
        );
    }

    $('#cancel-update-button').on('click', function() {
        window.location.href = './read-envelope.html?id=' + envelope_id;
    } );

    $('#update-envelope-form').on('submit', function(event) {
        event.preventDefault();
        $('#message-container').html('');
        $('#submit').prop("disabled", true);

        const token = Init.getToken();

        var $envelope_title = $('#envelope_title').val();
        var $envelope_description = $('#envelope_description').val();
        var $envelope_frequency = $('#envelope_frequency').val();
        var $scheduled_send_date = $('#scheduled_send_date').val();
        var $reminder_alert = $('#envelope_reminder_alert').is(":checked");
        var $delivery_report = $('#envelope_delivery_report').is(":checked");

        $.ajax({
            type: 'PATCH',
            url: protocol + '//api.' + base_domain + '/v1/envelopes/' + envelope_id,
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + token);
            },
            data: {
                title: $envelope_title,
                description: $envelope_description,
                frequency: $envelope_frequency,
                scheduled_send_date: $scheduled_send_date,
                reminder_alert: $reminder_alert ? "enabled" : "disabled",
                delivery_report: $delivery_report ? "enabled" : "disabled",
            },
            error: function(response) {
                var err = JSON.parse(response.responseText);
                var errorHtml = Init.generateErrorHtml(err.message);
                $('#message-container').html(errorHtml);
                $('#submit').prop("disabled", false);
            },
            success: function (response) {
                var $status = response.status;

                if ($status === 'success') {
                    var successHtml = Init.generateSuccessHtml(response.message);
                    $('#message-container').html(successHtml);

                    window.location.href = './read-envelope.html?id=' + envelope_id;
                }
            }
        });
    });
});