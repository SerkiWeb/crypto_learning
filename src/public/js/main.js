(function () {
    var resultButton = document.getElementById("result");
    resultButton.onclick = getResult;

    function getResult() {
        var request = new XMLHttpRequest();
        request.onreadystatechange = function() {
            if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
                var response = JSON.parse(this.responseText);
                console.log(response);
                displayResult(response);
            }
        };
        request.open("GET", "http://localhost:8080/getResult/");
        request.send();
    }
})();
