<script lang="ts" setup>
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "vue-chartjs";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);
</script>

<template>
  <Line :data="chartData" :options="options" />
</template>

<script lang="ts">
export default {
  components: {
    Line,
  },
  props: {
    metrics: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    const metricsArr: any[] = Array.isArray(this.metrics)
      ? (this.metrics as any[])
      : [];

    // Y-axis max: take the FIRST sample's (used + available) per mount
    let maxGb = 0;
    if (metricsArr.length > 0) {
      const first = metricsArr[0];
      const disks = Array.isArray(first?.disks) ? first.disks : [];
      const byMount: Record<string, { used: number; available: number }> =
        {} as any;
      disks.forEach((d: any) => {
        const mount = d?.mountpoint || "unknown";
        const used = Number(d?.used || 0);
        const available = Number(d?.available || 0);
        if (!byMount[mount]) byMount[mount] = { used: 0, available: 0 };
        byMount[mount].used += used;
        byMount[mount].available += available;
      });
      Object.values(byMount).forEach(({ used, available }) => {
        // values are in 1024-byte blocks → GiB = blocks / 1,048,576
        const totalGb = (used + available) / 1_048_576;
        if (totalGb > maxGb) maxGb = totalGb;
      });
    }
    const yMax = Math.ceil(Math.max(maxGb, 1) * 1.2);

    return {
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: {
            display: true,
            labels: {
              usePointStyle: true,
              boxWidth: 10,
              boxHeight: 6,
              padding: 8,
              // Hide any dataset whose label ends with " Total"
              filter: (item: any, data: any) => {
                const ds = data?.datasets?.[item.datasetIndex];
                const label = String(ds?.label || "");
                return !/ Total$/.test(label);
              },
            },
          },
          tooltip: {
            // Hide "Total" datasets from tooltip as well
            filter: (item: any) => {
              const label = String(item?.dataset?.label || "");
              return !/ Total$/.test(label);
            },
            callbacks: {
              label: (context: any) => {
                const val = Number(context.parsed.y || 0).toLocaleString();

                const raw = String(context.dataset.label || "");
                const isUsed = /\bUsed\b$/i.test(raw);
                const isAvail = /\bAvailable\b$/i.test(raw);
                let name = raw.replace(/\s+(Used|Available)$/i, "");
                const suffix = isUsed ? "Used" : isAvail ? "Available" : "";
                const label = suffix ? `${name} (${suffix})` : raw;
                return `${label}: ${val} GiB`;
              },
            },
          },
        },
        scales: {
          y: {
            position: "right",
            beginAtZero: true,
            ticks: {
              callback: (value: any) => `${Number(value).toLocaleString()} GiB`,
            },
            max: yMax,
          },
          x: {
            ticks: {
              autoSkip: true,
              maxTicksLimit: 10,
              maxRotation: 0,
              callback: (index: number) => {
                const time = (this as any).labels[index];
                return time
                  .toLocaleTimeString(navigator.language, {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                  .replace(/AM|PM/, "");
              },
            },
          },
        },
      } as any,
      data: this.chartData,
    };
  },
  methods: {
    hex2rgba(hex: string, alpha: number = 1) {
      const match = hex.match(/\w\w/g);
      if (!match) return `rgba(59,130,246,${alpha})`;
      const [r, g, b] = match.map((x: string) => parseInt(x, 16));
      return `rgba(${r},${g},${b},${alpha})`;
    },
    formatMountName(mount: string) {
      if (mount === "/") return "OS";
      if (mount === "/demos") return "Demos";
      return mount;
    },
  },
  computed: {
    chartData() {
      const metricsArr: any[] = Array.isArray(this.metrics)
        ? (this.metrics as any[])
        : [];

      // Collect all mount points across all ticks
      const mountSet = new Set<string>();
      metricsArr.forEach((point: any) => {
        const disks = Array.isArray(point.disks) ? point.disks : [];
        disks.forEach((d: any) => {
          const mount = d?.mountpoint || "unknown";
          mountSet.add(mount);
        });
      });
      const mounts = Array.from(mountSet).sort();

      const colorPalette = [
        "#3b82f6", // blue-500
        "#10b981", // emerald-500
        "#f59e0b", // amber-500
        "#ef4444", // red-500
        "#8b5cf6", // violet-500
        "#06b6d4", // cyan-500
        "#22c55e", // green-500
        "#eab308", // yellow-500
        "#f97316", // orange-500
        "#a855f7", // purple-500
      ];
      const colorForIndex = (i: number) =>
        colorPalette[i % colorPalette.length];

      const toGb = (bytes: number) => Number((bytes / 1_048_576).toFixed(2));

      const datasets = mounts.flatMap((mount, idx) => {
        const color = colorForIndex(idx);
        // Compute constant Total from first sample for this mount
        const first = metricsArr[0];
        const firstDisks = Array.isArray(first?.disks) ? first.disks : [];
        const firstForMount = firstDisks.filter(
          (d: any) => (d?.mountpoint || "unknown") === mount,
        );
        const firstUsed = firstForMount.reduce(
          (sum: number, d: any) => sum + Number(d?.used || 0),
          0,
        );
        const firstAvail = firstForMount.reduce(
          (sum: number, d: any) => sum + Number(d?.available || 0),
          0,
        );
        const totalConstGb = toGb(firstUsed + firstAvail);
        const labelBase = this.formatMountName(mount);
        const used = {
          label: `${labelBase} Used`,
          fill: false,
          borderColor: this.hex2rgba(color, 1),
          backgroundColor: this.hex2rgba(color, 0.15),
          pointRadius: 0,
          tension: 0.3,
          data: metricsArr.map((point: any) => {
            const disks = Array.isArray(point.disks) ? point.disks : [];
            const totalUsedBytes = disks
              .filter((d: any) => (d?.mountpoint || "unknown") === mount)
              .reduce((sum: number, d: any) => sum + Number(d?.used || 0), 0);
            return toGb(totalUsedBytes);
          }),
          spanGaps: true,
        } as any;
        const available = {
          label: `${labelBase} Available`,
          fill: false,
          borderColor: this.hex2rgba(color, 1),
          backgroundColor: this.hex2rgba(color, 0.15),
          borderDash: [6, 4],
          pointRadius: 0,
          tension: 0.3,
          data: metricsArr.map((point: any) => {
            const disks = Array.isArray(point.disks) ? point.disks : [];
            const totalAvailBytes = disks
              .filter((d: any) => (d?.mountpoint || "unknown") === mount)
              .reduce(
                (sum: number, d: any) => sum + Number(d?.available || 0),
                0,
              );
            return toGb(totalAvailBytes);
          }),
          spanGaps: true,
        } as any;
        const total = {
          label: `${labelBase} Total`,
          fill: false,
          borderColor: this.hex2rgba(color, 0.5),
          backgroundColor: this.hex2rgba("#9ca3af", 0.2),
          borderDash: [2, 2],
          pointRadius: 0,
          tension: 0.3,
          data: metricsArr.map(() => totalConstGb),
          spanGaps: true,
        } as any;
        return [used, available, total];
      });

      return {
        labels: this.labels,
        datasets,
      };
    },
    labels() {
      return (Array.isArray(this.metrics) ? this.metrics : []).map(
        (metric: any) => new Date(metric.time),
      );
    },
  },
};
</script>
