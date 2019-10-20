let ndx, all, yearMonthDim, yearDim, monthDim, qtrDim, propertyDim;

window.onload = () => {
  //Category,SubCategory,Property,Amount,Year,Month
  let months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];
  d3.csv("src/ExpData12-18.csv").then(function(data) {
    data.forEach(function(d) {
      //d.Amount = +(+d.Amount).toFixed(2);
      d.Amount = +d.Amount;
      d.Year = +d.Year;
      d.MonthNumber = months
        .indexOf(d.Month)
        .toString()
        .padStart(2, "0");
      d.Qtr = "Qtr-" + (Math.floor(months.indexOf(d.Month) / 3) + 1);
    });
    //console.log(data);
    function print_filter(filter) {
      var f = eval(filter);
      if (typeof f.length != "undefined") {
      } else {
      }
      if (typeof f.top != "undefined") {
        f = f.top(Infinity);
      } else {
      }
      if (typeof f.dimension != "undefined") {
        f = f
          .dimension(function(d) {
            return "";
          })
          .top(Infinity);
      } else {
      }
      //console.log(f);
      console.log(
        filter +
          "(" +
          f.length +
          ") = " +
          JSON.stringify(f)
            .replace("[", "[\n\t")
            .replace(/}\,/g, "},\n\t")
            .replace("]", "\n]")
      );
    }

    ndx = crossfilter(data);
    all = ndx.groupAll().reduceSum(d => d.Amount);

    //display total amount
    let total = dc.numberDisplay("#total");
    total
      .formatNumber(d3.format(".2s"))
      .valueAccessor(d => d)
      .group(all);

    yearDim = ndx.dimension(d => d.Year);
    let filterYear = dc.selectMenu("#filterYear");
    filterYear
      .dimension(yearDim)
      .multiple(true)
      .numberVisible(8)
      .group(yearDim.group());

    monthDim = ndx.dimension(d => d.Month);
    let filterMonth = dc.selectMenu("#filterMonth");
    filterMonth
      .dimension(monthDim)
      .multiple(true)
      .numberVisible(13)
      .group(monthDim.group())
      .order((a, b) => {
        let akey = months.indexOf(a.key);
        let bkey = months.indexOf(b.key);
        return akey > bkey ? 1 : bkey > akey ? -1 : 0;
      });

    qtrDim = ndx.dimension(d => d.Qtr);
    let filterQtr = dc.selectMenu("#filterQtr");
    filterQtr
      .dimension(qtrDim)
      .multiple(true)
      .numberVisible(5)
      .group(qtrDim.group());

    propertyDim = ndx.dimension(d => d.Property);
    let filterProp = dc.selectMenu("#filterProp");
    filterProp
      .dimension(propertyDim)
      .multiple(true)
      .numberVisible(3)
      .group(propertyDim.group());

    yearMonthDim = ndx.dimension(function(d) {
      return [d.Year, d.MonthNumber];
    });

    let dataTable = dc.dataTable("#tableData");
    dataTable
      .width(450)
      .dimension(yearMonthDim)
      .showGroups(false)
      .group(function(d) {
        return [d.Year, d.MonthNumber];
      })
      .columns([
        "Year",
        "Month",
        "Category",
        "SubCategory",
        "Property",
        { label: "Amount ($)", format: d => d.Amount.toFixed(2) }
      ])
      .size(data.length);

    dc.renderAll();
  });
};
