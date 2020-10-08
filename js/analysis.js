if(localStorage.getItem("name") === null){
    window.location.href="home.html";
}

let user_id = localStorage.getItem("userId")

document.querySelector('#user_dp').setAttribute("src",localStorage.getItem("picture"));
document.querySelector('#user_name').textContent=localStorage.getItem("name");

let categories = ['Bills', 'Grocery', 'Rent & Mortgages','Lifestyle', 'Healthcare'];
let weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

dataLoad();
function dataLoad() {
    firebase.database().ref('users/' + user_id).once('value').then(function (snapshot) {
        let dataAll = snapshot.val();
        //console.log(data)
        let data = [];
        let date = new Date();
        let currMonth = date.getMonth();
        currMon();
        function currMon(){
            for (let id in dataAll) {
                let expDate = new Date(dataAll[id].date);
                if (expDate.getMonth() === currMonth) {
                    data.push(id);
                }
            }
        }
        let mid = '#' + String(currMonth);
        console.log(mid)
        $(mid).css('display','none')

        $('#time-period').change(function () {
            data = [];
            if ($(this).val() === 'all-time'){
                for (let id in dataAll){
                    data.push(id);
                }
            }else if ($(this).val() === 'this-month') {
                currMon();
            } else {
                let selMonth = Number($(this).val());
                for (let id in dataAll) {
                    let expDate2 = new Date(dataAll[id].date);
                    if (expDate2.getMonth() === selMonth) {
                        data.push(id);
                    }
                }
            }

            categorical();
            daily();
            weekly();
            stats();
        });

        stats();
        function stats() {
            totalDebit = 0;
            totalCredit = 0;
            for (let id in data) {
                if (dataAll[data[id]].type === "Credit") {
                    totalCredit += Number(dataAll[data[id]].amount);
                } else {
                    totalDebit += Number(dataAll[data[id]].amount);
                }
            }

            //set income, expense & savings
            let saved = totalCredit - totalDebit;
            if (String(totalCredit).length > 6 || String(totalDebit).length > 6 || String(saved).length > 6){
                $('#tot-in').css('font-size', '2.5rem');
                $('#tot-exp').css('font-size', '2.5rem');
                $('#tot-save').css('font-size', '2.5rem');
            }else{
                $('#tot-in').css('font-size', '3.5rem');
                $('#tot-exp').css('font-size', '3.5rem');
                $('#tot-save').css('font-size', '3.5rem');
            }
            $('#tot-in').text(totalCredit);
            $('#tot-exp').text(totalDebit);
            if (saved < 0) {
                $('#tot-save').text('0');
            } else {
                $('#tot-save').text(totalCredit - totalDebit);
            }
        }

        weekly();
        function weekly() {
            console.log(data);
            let dailyExp = [];
            weekdays.forEach(function (value) {
                let totalExp = 0;
                for (let id in data) {
                    let d = new Date(dataAll[data[id]].date);
                    if (weekdays[d.getDay()] === value && dataAll[data[id]].type === 'Debit') {
                        totalExp += Number(dataAll[data[id]].amount);
                    }
                }
                dailyExp.push(totalExp);
            })

            let myGraph = [{
                x: weekdays,
                y: dailyExp,
                type: 'bar'
            }];
            let layout = {
                title: 'Day Wise Expenditure',
                xaxis: {title: 'DAYS'},
                yaxis: {title: 'AMOUNT'},
                plot_bgcolor: 'transparent',
                paper_bgcolor: 'transparent',
                font: {color: '#777'},
            }
            let config = {
                responsive: true,
                displayModeBar: false,
            }
            Plotly.newPlot('bar-graph', myGraph, layout, config);

            $('#pie').css('color', 'gray');
            $('#line').css('color', 'gray');
            $('#bar').css('color', 'dodgerblue');
        }


        $('#bar').click(weekly);

        function categorical() {
            let categoryExp = [];
            categories.forEach(function (value) {
                let totalExp = 0;
                for (let id in data) {
                    if (dataAll[data[id]].category === value) {
                        totalExp += Number(dataAll[data[id]].amount)
                    }
                }
                categoryExp.push(totalExp);
            })
            let myGraph2 = [{
                labels: categories,
                values: categoryExp,
                type: 'pie',
                marker: {
                    colors: ['royalblue','dodgerblue', 'deepskyblue', 'lightgray', 'lightskyblue'],
                },
                textinfo: "label+percent",
                insidetextorientation: "radial"
            }];
            let layout = {
                plot_bgcolor: 'transparent',
                paper_bgcolor: 'transparent',
                font: {color: '#777'},
            }
            let config = {
                responsive: true,
                displayModeBar: false,
            }
            Plotly.newPlot('bar-graph', myGraph2, layout, config);
            $('#pie').css('color', 'dodgerblue');
            $('#line').css('color', 'gray');
            $('#bar').css('color', 'gray');
        }

        $('#pie').click(categorical);

        function daily() {
            let paydays = [];
            let income = [];
            let justdays = [];
            let expense = [];
            for (let id in data) {
                if (dataAll[data[id]].type === "Credit") {
                    //console.log('credit found')
                    paydays.push(dataAll[data[id]].date);
                    income.push(Number(dataAll[data[id]].amount));
                } else {
                    //console.log('debit found')
                    justdays.push(dataAll[data[id]].date);
                    expense.push(Number(dataAll[data[id]].amount));
                }
            }

            incomeLine = {
                x: paydays,
                y: income,
                type: 'scatter',
                name: 'Credit',
                line: {
                    color: 'skyblue',
                    width: 3
                }
            };

            expenseLine = {
                x: justdays,
                y: expense,
                type: 'scatter',
                name: 'Debit',
                line: {
                    color: 'rgb(219, 64, 82)',
                    width: 3
                }
            };
            let layout = {
                title: 'Credit vs. Debit',
                xaxis: {title: 'DAYS'},
                yaxis: {title: 'AMOUNT'},
                plot_bgcolor: 'transparent',
                paper_bgcolor: 'transparent',
                font: {color: '#777'},
            }
            let config = {
                responsive: true,
                displayModeBar: false,
                scrollZoom: true
            }

            let myGraph3 = [incomeLine, expenseLine];
            Plotly.newPlot('bar-graph', myGraph3, layout, config);
            $('#pie').css('color', 'gray');
            $('#line').css('color', 'dodgerblue');
            $('#bar').css('color', 'gray');
        }

        $('#line').click(daily);
    });
};

$('.custom-button').click(function (){
    $(this).css('outline', 'none');
});

//*********************************************************************************************************************

//for changing theme
$('#theme-switch').click(function (){
    if ($(this).is(":checked")){
        $('#theme').attr('href','css/style-dark.css');
    }else{
        $('#theme').attr('href','css/style-light.css');
    }
});

//*********************************************************************************************************************

//for logging out user
document.querySelector('#logout').addEventListener('click',function () {

    firebase.auth().signOut().then(function() {
        // Sign-out successful.
        localStorage.removeItem("name");
        localStorage.removeItem("picture");
        localStorage.removeItem("userId");

        window.location.href="home.html";

    }).catch(function(error) {
        alert("Some error occurred")
    });
});

//*********************************************************************************************************************