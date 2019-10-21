let ndx, all, yearMonthDim, yearDim, monthDim, qtrDim, propertyDim, categoryDim, subcategoryDim;
let chartCategory, chartSubcategory, chartYear, chartMonth;
let matrixMonth, matrixQtr;

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
      d.Qtr = (Math.floor(months.indexOf(d.Month) / 3) + 1);
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

    //setting filters
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
    filterQtr
    .title(d => "Qtr-"+d.key + ": "+ d.value);

    propertyDim = ndx.dimension(d => d.Property);
    let filterProp = dc.selectMenu("#filterProp");
    filterProp
      .dimension(propertyDim)
      .multiple(true)
      .numberVisible(3)
      .group(propertyDim.group());

    //chartCategory
    categoryDim=ndx.dimension(d => d.Category);
    let categoryAmountGroup = categoryDim.group()
    .reduceSum(function(d){
        return d.Amount;
    });

    chartCategory = dc.pieChart("#chartCategory");
    chartCategory
      .dimension(categoryDim)
      .group(categoryAmountGroup)
      .renderLabel(true)
      .title(d => d.key + ': $'+d.value.toFixed(2));

    //chartSubcategory
    subcategoryDim=ndx.dimension(d => d.SubCategory);
    let subcategoryAmountGroup = subcategoryDim.group()
    .reduceSum(function(d){
        return d.Amount;
    });

    chartSubcategory = dc.pieChart("#chartSubcategory");
    chartSubcategory
      .dimension(subcategoryDim)
      .group(subcategoryAmountGroup)
      .renderLabel(true)
      .title(d => d.key + ': $'+d.value.toFixed(2));

    //chartYear
    let yearAmountGroup = yearDim.group()
    .reduceSum(function(d){
        return d.Amount;
    });
    let cayxScale=d3.scaleOrdinal().domain( yearAmountGroup.all().map(d=>d.key));

    chartYear = dc.barChart('#chartYear');
    chartYear 
        // .margins({top: 10, right: 50, bottom: 30, left: 40})
        .dimension(yearDim)
        .group(yearAmountGroup)
        .elasticY(true)
        .yAxisLabel("Total Amount")
        .xAxisLabel("Year")
        .title(function(d){ return d.key +": $"+d.value.toFixed(2) })
        .gap(5)
        .x(cayxScale)
        .xUnits(dc.units.ordinal)
        .renderHorizontalGridLines(true);
    chartYear.yAxis().tickFormat(d => (d/1000)+"K");

    //chartMonth
    let monthAmountGroup = monthDim.group()
    .reduceSum(function(d){
        return d.Amount;
    });
    let camxScale=d3.scaleOrdinal().domain( monthAmountGroup.all().map(d=>d.key));

    chartMonth = dc.barChart('#chartMonth');
    chartMonth 
        // .margins({top: 10, right: 50, bottom: 30, left: 40})
        .dimension(monthDim)
        .group(monthAmountGroup)
        .elasticY(true)
        .yAxisLabel("Total Amount")
        .xAxisLabel("Month")
        .title(function(d){ return d.key +": $"+d.value.toFixed(2) })
        .gap(5)
        .x(camxScale)
        .xUnits(dc.units.ordinal)
        .renderHorizontalGridLines(true);
        chartMonth.yAxis().tickFormat(d => (d/1000)+"K");


//matrixMonth
    yearMonthDim = ndx.dimension(function(d) {
        return [d.Year, d.MonthNumber];
    });
    let yearMonthAmountGroup = yearMonthDim.group()
        .reduceSum(d => d.Amount);

    matrixMonth = dc.heatMap("#matrixMonth");
    matrixMonth
    .margins({top: 10, right: 10, bottom: 30, left: 50})
        .dimension(yearMonthDim)
        .group(yearMonthAmountGroup)
    .rowsLabel(d => months[d])
    .keyAccessor(function(d) { return +d.key[0]; })
    .valueAccessor(function(d) { return +d.key[1]; })
    .colorAccessor(function(d) { return +d.value; })
    .title(function(d) {
        return "Year:   " + d.key[0] + "\n" +
               "Month:  " + months[d.key[1]] + "\n" +
               "Amount: $" + d.value.toFixed(2) ;})
            //    .colors(["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"])
    .colors(
        d3.scaleLinear()
        .domain(d3.extent(yearMonthAmountGroup.all().map(d=>d.value)))
        .range(["white","red"])
    )
    .calculateColorDomain();
    // .on('pretransition', function(chart) {
    //     // chart.selectAll('rect.heat-box')
    //     chart.selectAll('g.box-group')
    //     .attr("fill-opacity","0.25")
    //     .append("text")
    //     // .attr("x", d => x(d.value))
    //     // .attr("width","100%")
    //     // .attr("height","100%")
    //     .attr("fill","black")
    //     .attr("dy",".35em")
    //     .text(d => {return "$"+d.value.toFixed(2);});
    //     console.log(chart);
    // });

    //console.log(d3.extent(yearMonthAmountGroup.all().map(d=>d.value)));
//matrixQtr
yearQtrDim = ndx.dimension(function(d) {
    return [d.Year, d.Qtr];
});
let yearQtrAmountGroup = yearQtrDim.group()
    .reduceSum(d => d.Amount);

    matrixQtr = dc.heatMap("#matrixQtr");
    matrixQtr
.margins({top: 10, right: 10, bottom: 30, left: 30})
    .dimension(yearQtrDim)
    .group(yearQtrAmountGroup)
.rowsLabel(d => "Qtr-"+d)
.keyAccessor(function(d) { return +d.key[0]; })
.valueAccessor(function(d) { return +d.key[1]; })
.colorAccessor(function(d) { return +d.value; })
.title(function(d) {
    return "Year:   " + d.key[0] + "\n" +
           "Qtr:  " + d.key[1] + "\n" +
           "Amount: $" + d.value.toFixed(2) ;})
        //    .colors(["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"])
.colors(
    d3.scaleLinear()
    .domain(d3.extent(yearQtrAmountGroup.all().map(d=>d.value)))
    .range(["white","red"])
)
.calculateColorDomain();

    //setting table

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
