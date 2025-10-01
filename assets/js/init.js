// init.js
window.Init = {
    accessToken: null,

    // Set token into cookie
    setCookieToken: function (token, days = 7) {
        this.accessToken = token;
        let expires = "";
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = "accessToken=" + token + expires + "; path=/";
    },

    // Get token from memory or cookie
    getCookieToken: function () {
        if (this.accessToken) return this.accessToken;

        const match = document.cookie.match(new RegExp("(^| )accessToken=([^;]+)"));
        if (match) {
            this.accessToken = match[2];
        }
        return this.accessToken;
    },

    // Remove token from cookie
    clearCookieToken: function () {
        this.accessToken = null;
        document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    },

    // Helper for API calls
    apiRequest: function (endpoint, method = "GET", data = null) {
        return $.ajax({
            url: endpoint,
            method: method,
            data: data ? JSON.stringify(data) : null,
            contentType: "application/json",
            headers: {
                "Authorization": "Bearer " + this.getToken()
            }
        });
    },


    getBaseDomain: function () {
        const hostname = $(location).attr('hostname');
        const domain_parts = hostname.split('.');
        domain_parts.shift();
        return domain_parts.join('.');
    },

    // Redirect URL
    redirectUrl: function (url) {
        window.location.href = url;
    },

    redirectIfLoggedIn: function () {
        const token = this.getToken();

        if (token !== null) {
            window.location.href = '../home';
        }
    },

    // Retrieve token from session storage
    getToken: function () {
        return sessionStorage.getItem('access_token');
    },

    // Clear token from session storage
    clearToken: function () {
        sessionStorage.clear();
    },

    formatDate: function () {

    },

    // Function to get the ID from the URL
    getIdFromUrl: function () {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    },

    generateSuccessHtml: function (message) {
        return '<div class="alert alert-success alert-dismissible fade show" role="alert">' +
            '   <div><i class="fas fa-check-circle"> </i> ' + message + '</div>' +
            '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>' +
            '</div>';
    },

    generateErrorHtml: function (message) {
        return '<div class="alert alert-danger alert-dismissible fade show" role="alert">' +
            '   <div><i class="fas fa-exclamation-triangle"> </i> ' + message + '</div>' +
            '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>' +
            '</div>';
    },

};