
window.onload = function() {
    console.log('on load');
    setInterval(update, 5000);
}

function getPrice() {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
            document.getElementById('load_details').style.display = 'none';
            var response = this.responseText;
            console.log(response);
            document.getElementById('price_details').innerHTML = response;
        }

        if (this.readyState == XMLHttpRequest.LOADING) {
            document.getElementById('load_details').style.display = '';
        }
    };
    request.open("GET", "http://localhost:8080/markets");
    request.send();
}

function getForce() {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
            document.getElementById('load_force').style.display = 'none';
            var response = this.responseText;
            console.log(response);
            document.getElementById('force').innerHTML = response;
        } 

        if (this.readyState == XMLHttpRequest.LOADING) {
            document.getElementById('load_force').style.display = '';
        }
    }
    request.open("GET", "http://localhost:8080/force");
    request.send();
}

function getResistanceSupport() {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
            document.getElementById('load_resistance').style.display = 'none';
            var response = this.responseText;
            console.log(response);
            document.getElementById('resistance').innerHTML = response;
        } 

        if (this.readyState == XMLHttpRequest.LOADING) {
            document.getElementById('load_resistance').style.display = '';
        }
    }
    request.open("GET", "http://localhost:8080/resistance");
    request.send();
}

function update() {
    getPrice();
    getForce();
    getResistanceSupport();
}

