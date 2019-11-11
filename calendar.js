var calendar = {
  //props
  months : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], 
  data : null, 
  selectedDay : 0, 
  selectedMonth : 0, 
  selectedYear : 0, 
  

  //methods
  drawCalendar : function () {

    calendar.selectedMonth = parseInt(document.getElementById("calendar-mth").value);
    calendar.selectedYear = parseInt(document.getElementById("calendar-yr").value);
    let monthDays = new Date(calendar.selectedYear, calendar.selectedMonth+1, 0).getDate(), 
        startDay = new Date(calendar.selectedYear, calendar.selectedMonth, 1).getDay(), 
        endDay = new Date(calendar.selectedYear, calendar.selectedMonth, monthDays).getDay(); 

    //backend dupa o luna in Vaslui(ca sa retinem eventurile puse pe o zi, for a while at least)
    calendar.data = localStorage.getItem("calendar-" + calendar.selectedMonth + "-" + calendar.selectedYear);
    
    if (calendar.data==null) {
      localStorage.setItem("calendar-" + calendar.selectedMonth + "-" + calendar.selectedYear, "{}");
      calendar.data = {};
    } else {
      calendar.data = JSON.parse(calendar.data);
    }

    // DRAWING
    // b pentru casute goale
    var squares = [];
    //zilele saptamanii sunt de la 0 la 6 si duminica e 0 aparent, super weird...
    if (startDay != 1) { 
      var blanks;

      if(startDay === 0) {
        blanks = 6; //luni,...,sambata sunt goale
      }
      else {
        blanks = startDay - 1; //sunt goale doar cele pana la ziua de start
      }

      for (var i=1; i<=blanks; i++) { 
        squares.push("b"); 
      }
    }
    // pentru zilele lunii punem data [1,2...,monthDays]
    for (var i=1; i<=monthDays; i++) { squares.push(i); }

    //zilele ramase goale de la sfarsitul lunii
    if (endDay != 0) {

      var blanks = 7 - endDay;
      for (var i=1; i<=blanks; i++) { 
        squares.push("b"); 
      }

    }
  
    // Populare tabel
    var container = document.getElementById("calendar-container"),
        cTable = document.createElement("table");
    cTable.id = "calendar";
    container.innerHTML = "";
    container.appendChild(cTable);

    //Primul rand - ori asa ori cu thead
    var cRow = document.createElement("tr"),
        cCell = null,
        days = ["Mon", "Tue", "Wed", "Thur", "Fri", "Sat","Sun"];
  
    for (var d of days) {
      cCell = document.createElement("td");
      cCell.innerHTML = d;
      cRow.appendChild(cCell);
    }
    cRow.classList.add("head");
    cTable.appendChild(cRow);

    //Acum zilele din luna
    var total = squares.length;
    cRow = document.createElement("tr");
    cRow.classList.add("day");

    for (var i=0; i<total; i++) {
      cCell = document.createElement("td");
      if (squares[i]=="b") { 
        cCell.classList.add("blank"); 
      }
      else {
        cCell.innerHTML = "<div class='dd'>"+squares[i]+"</div>";
        if (calendar.data[squares[i]]) {
          cCell.innerHTML += "<div class='evt'>" + calendar.data[squares[i]] + "</div>";
        }
        cCell.addEventListener("click", function(){
          calendar.show(this);
        });
      }

      cRow.appendChild(cCell);
      // cand ajungem la final de rand
      if (i!=0 && (i+1)%7==0) { 
        cTable.appendChild(cRow);
        cRow = document.createElement("tr");
        cRow.classList.add("day");
      }
    }

    // Inchidem pop up ul pt add event
    calendar.close();
  },

  show : function (el) {
  //edit pop-up
  // el o sa ne indice elementul care a surprins event-ul de click

    // vedem ce exista
    calendar.selectedDay = el.getElementsByClassName("dd")[0].innerHTML;

    // Construim formul
    var tForm = "<h1>" + (calendar.data[calendar.selectedDay] ? "EDIT" : "ADD") + " EVENT</h1>";
    tForm += "<div id='evt-date'>" + calendar.selectedDay + " " + calendar.months[calendar.selectedMonth] + " " + calendar.selectedYear + "</div>";
    tForm += "<textarea id='evt-details' required>" + (calendar.data[calendar.selectedDay] ? calendar.data[calendar.selectedDay] : "") + "</textarea>";
    tForm += "<input type='button' value='Close' onclick='calendar.close()'/>";
    tForm += "<input type='button' value='Delete' onclick='calendar.del()'/>";
    tForm += "<input type='submit' value='Save'/>";

    //il atasam
    var eForm = document.createElement("form");
    eForm.addEventListener("submit", calendar.save);
    eForm.innerHTML = tForm;
    var container = document.getElementById("calendar-event");
    container.innerHTML = "";
    container.appendChild(eForm);
  },

  close : function () {
  //cu ea inchidem pop-up ul

    document.getElementById("calendar-event").innerHTML = "";
  },

  save : function (evt) {
  // save event

    evt.stopPropagation();
    evt.preventDefault();
    calendar.data[calendar.selectedDay] = document.getElementById("evt-details").value;
    localStorage.setItem("calendar-" + calendar.selectedMonth + "-" + calendar.selectedYear, JSON.stringify(calendar.data));
    calendar.drawCalendar();
  },

  del : function () {
  // delete event

    if (confirm("Remove event?")) {
      delete calendar.data[calendar.selectedDay];
      localStorage.setItem("calendar-" + calendar.selectedMonth + "-" + calendar.selectedYear, JSON.stringify(calendar.data));
      calendar.drawCalendar();
    }
  }
};

// INIT - DRAW MONTH & YEAR SELECTOR
window.addEventListener("load", function () {
  // Data curenta
  var currentDate = new Date(),
      currentMonth = currentDate.getMonth(),
      currentYear = parseInt(currentDate.getFullYear());

  //select pt luni
  var month = document.getElementById("calendar-mth");
  for (var i = 0; i < 12; i++) {
    var opt = document.createElement("option");
    opt.value = i;
    opt.innerHTML = calendar.months[i];
    if (i==currentMonth) { opt.selected = true; }
    month.appendChild(opt);
  }

  // select pt ani
  var year = document.getElementById("calendar-yr");
  for (var i = currentYear-10; i<=currentYear+10; i++) {
    var opt = document.createElement("option");
    opt.value = i;
    opt.innerHTML = i;
    if (i==currentYear) { opt.selected = true; }
    year.appendChild(opt);
  }

  // primul draw
  document.getElementById("calendar-set").addEventListener("click", calendar.drawCalendar); // onClick  pe butonul de set
  calendar.drawCalendar();
});