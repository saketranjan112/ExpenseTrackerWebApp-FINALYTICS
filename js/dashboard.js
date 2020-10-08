if(localStorage.getItem("name") === null){
    window.location.href="index.html";
}

let user_id = localStorage.getItem("userId")


document.querySelector('#user_dp').setAttribute("src",localStorage.getItem("picture"));
document.querySelector('#user_name').textContent=localStorage.getItem("name");

let date = new Date();
let currMonth = date.getMonth();
let mid = '#' + String(currMonth);
$(mid).css('display','none')

dataLoad(currMonth);

function dataLoad(month){
    firebase.database().ref('/users/' + user_id).once('value').then(function(snapshot) {

        let dataAll = snapshot.val();
        //console.log(data)
        let data = [];

        if (month === 'all-time') {
            for (let id in dataAll) {
                data.push(id);
            }
        } else if (month === 'this-month') {
            for (let id in dataAll) {
                let expDate2 = new Date(dataAll[id].date);
                if (expDate2.getMonth() === currMonth) {
                    data.push(id);
                }
            }
        } else {
            let selMonth = Number(month);
            for (let id in dataAll) {
                let expDate2 = new Date(dataAll[id].date);
                if (expDate2.getMonth() === selMonth) {
                    data.push(id);
                }
            }
        }

        let totalCredit = 0;
        let totalDebit = 0;

        //writing data in table
        document.querySelector('#expense-table').innerHTML = "";
        let counter = 1;
        for (let id in data) {
            //console.log(id);
            document.querySelector('#expense-table').innerHTML += `<tr>
<td style="padding-top: 1.5em">${counter}</td>
<td style="padding-top: 1.5em">${dataAll[data[id]].name}</td>
<td style="padding-top: 1.5em">${dataAll[data[id]].type}</td>
<td style="padding-top: 1.5em">${dataAll[data[id]].amount}</td>
<td style="padding-top: 1.5em">${dataAll[data[id]].category}</td>
<td style="padding-top: 1.5em">${dataAll[data[id]].date}</td>
<td><button class="edit btn btn-outline-light" style="border: transparent" value="${data[id]}"><img src="img/edit.png"></button> <button class="delete btn btn-outline-light" style="border: transparent" value="${data[id]}"><img src="img/del.png"></button></td>
</tr>`

            //calculate total income and expense
            if (dataAll[data[id]].type === "Credit") {
                totalCredit += Number(dataAll[data[id]].amount);
            } else {
                totalDebit += Number(dataAll[data[id]].amount);
            }

            counter++;
        };

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

        //open editing modal
        $('.edit').click(function () {
            let entry = $(this).val();
            $('#myModal').modal();
            $('#edit-name').val(dataAll[entry].name);
            $('#edit-amount').val(dataAll[entry].amount);
            $('#edit-category').val(dataAll[entry].category);
            if (dataAll[entry].type === 'Debit') {
                $('#edit-category .debit').css('display', 'block');
                $('#edit-category .credit').css('display', 'none');
            } else {
                $('#edit-category .credit').css('display', 'block');
                $('#edit-category .debit').css('display', 'none');
            }
            //for editing transactions
            $('#save-edit').click(function (){
                if ( $('#edit-name').val() !== '' && $('#edit-amount').val() !== ''){
                    firebase.database().ref('/users/' + user_id + '/' + entry).update({
                        name: $('#edit-name').val(),
                        amount: $('#edit-amount').val(),
                        category: $('#edit-category').val(),
                    }, function (error){
                        return 0;
                    });

                    $('#myModal').modal('hide');

                    let mn = $('#time-period').val();
                    dataLoad(mn);
                }
            });
        });

        //for deleting transactions
        $('.delete').click(function (){
            console.log('clicked')
            let id = $(this).val();
            firebase.database().ref('/users/' + user_id + '/' + id).remove();
            dataLoad($('#time-period').val());
        });

    });
}


//*********************************************************************************************************************

//for logging out user
document.querySelector('#logout').addEventListener('click',function () {

    firebase.auth().signOut().then(function() {
        // Sign-out successful.
        localStorage.removeItem("name");
        localStorage.removeItem("picture");
        localStorage.removeItem("userId");

        window.location.href="index.html";

    }).catch(function(error) {
        alert("Some error occurred")
    });
});

//*********************************************************************************************************************

//for showing type specific categories
$('#expense-type').change(function (){
    if ($(this).val() === 'Credit'){
        //console.log('credit')
        $('.credit').css('display','block');
        $('.debit').css('display','none');

    }else{
        //console.log('debit')
        $('.debit').css('display','block');
        $('.credit').css('display','none');

    }
});

//*********************************************************************************************************************

//for adding new data
document.querySelector('#add-expense').addEventListener('click', function (){

    let expenseName = document.querySelector('#expense-name').value;
    let expenseType = document.querySelector('#expense-type').value;
    let expenseAmount = document.querySelector('#expense-amount').value;
    let expenseDate = document.querySelector('#expense-date').value;
    let expenseTime = document.querySelector('#expense-time').value;
    let expenseCategory = document.querySelector('#expense-category').value;

    if ( expenseDate==='' || expenseCategory==='' || expenseType==='' || expenseTime==='' || expenseName==='' || expenseAmount===''){

    }else{
        let response = insertData(expenseName,expenseType,expenseAmount,expenseDate,expenseTime,expenseCategory);
        if (response){
            $('#exampleModal').modal('hide');
            let expmon = new Date(expenseDate);
            dataLoad(expmon.getMonth());
            document.querySelector('#expense-name').value = '';
            document.querySelector('#expense-type').value = '';
            document.querySelector('#expense-amount').value = '';
            document.querySelector('#expense-time').value = '';
            document.querySelector('#expense-date').value = '';
            document.querySelector('#expense-category').value = '';
        }
    }

    function insertData(name,type, amount, date, time, category){

        firebase.database().ref('users/' + user_id).push({
            name:name,
            type:type,
            amount:amount,
            date:date,
            time:time,
            category:category
        }, function (error){
            return 0;
        });

        return 1;
    };

});

//*********************************************************************************************************************

//for removing outline
$('.custom-button').click(function (){
    $(this).css('outline', 'none');
});

//*********************************************************************************************************************

//for specifying time period
$('#time-period').change(function () {
    dataLoad($(this).val());
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
