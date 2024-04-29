import { Component, Input, OnInit } from '@angular/core';
@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss']
})
export class PieChartComponent implements OnInit {
  @Input() activeCustomer:number;
  @Input() inActiveCustomer:number;
  public pieChartType = 'pie';
  public pieChartData = {
    labels: ['Active Customer', 'Inactive Customer'],
    datasets: [
      {
        label: 'Count',
        data: [0, 0],
        backgroundColor: [
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
        ],
      },
    ],
  };

  ngOnInit() {
      this.pieChartData.datasets[0].data[0] = this.activeCustomer;
      this.pieChartData.datasets[0].data[1] = this.inActiveCustomer;
  }
}
