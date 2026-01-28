'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'
import { Eye, MousePointer, Monitor, Smartphone, Tablet, Globe } from 'lucide-react'
import type { AnalyticsData } from '@/actions/analytics'

interface AnalyticsDashboardProps {
  data: AnalyticsData
}

export function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  }

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />
      case 'tablet':
        return <Tablet className="h-4 w-4" />
      default:
        return <Monitor className="h-4 w-4" />
    }
  }

  const getDeviceLabel = (type: string) => {
    switch (type) {
      case 'mobile':
        return 'Mobile'
      case 'tablet':
        return 'Tablet'
      case 'desktop':
        return 'Desktop'
      default:
        return 'Outro'
    }
  }

  // Combine page views and link clicks into a single chart data
  const combinedChartData = data.pageViewsByDay.map((pv, index) => ({
    date: formatDate(pv.date),
    pageViews: pv.count,
    linkClicks: data.linkClicksByDay[index]?.count || 0,
  }))

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Visualizações de Página</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalPageViews.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cliques em Links</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalLinkClicks.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Atividade</CardTitle>
          <CardDescription>Visualizações e cliques ao longo do tempo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={combinedChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => value.toLocaleString('pt-BR')}
                />
                <Tooltip
                  formatter={(value) => (value as number).toLocaleString('pt-BR')}
                  labelFormatter={(label) => `Data: ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="pageViews"
                  stackId="1"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                  name="Visualizações"
                />
                <Area
                  type="monotone"
                  dataKey="linkClicks"
                  stackId="2"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  fillOpacity={0.6}
                  name="Cliques"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Links */}
        <Card>
          <CardHeader>
            <CardTitle>Links Mais Clicados</CardTitle>
            <CardDescription>Top 10 links por cliques</CardDescription>
          </CardHeader>
          <CardContent>
            {data.topLinks.length > 0 ? (
              <div className="space-y-4">
                {data.topLinks.map((link, index) => (
                  <div key={link.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-sm font-medium text-muted-foreground w-6">
                        {index + 1}.
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{link.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{link.url}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold ml-2">{link.clicks}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhum clique registrado ainda
              </p>
            )}
          </CardContent>
        </Card>

        {/* Device Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Dispositivos</CardTitle>
            <CardDescription>Tipos de dispositivos dos visitantes</CardDescription>
          </CardHeader>
          <CardContent>
            {data.deviceStats.length > 0 ? (
              <div className="space-y-4">
                {data.deviceStats.map((stat) => {
                  const total = data.deviceStats.reduce((sum, s) => sum + s.count, 0)
                  const percentage = total > 0 ? Math.round((stat.count / total) * 100) : 0
                  return (
                    <div key={stat.type} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getDeviceIcon(stat.type)}
                          <span className="text-sm">{getDeviceLabel(stat.type)}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {stat.count} ({percentage}%)
                        </span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhum dado de dispositivo ainda
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Browser Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Navegadores</CardTitle>
            <CardDescription>Navegadores mais utilizados</CardDescription>
          </CardHeader>
          <CardContent>
            {data.browserStats.length > 0 ? (
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.browserStats} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" fontSize={12} />
                    <YAxis
                      type="category"
                      dataKey="browser"
                      fontSize={12}
                      width={80}
                    />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" name="Visitas" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhum dado de navegador ainda
              </p>
            )}
          </CardContent>
        </Card>

        {/* Referrer Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Origens de Tráfego</CardTitle>
            <CardDescription>De onde vêm seus visitantes</CardDescription>
          </CardHeader>
          <CardContent>
            {data.referrerStats.length > 0 ? (
              <div className="space-y-3">
                {data.referrerStats.map((stat) => (
                  <div key={stat.referrer} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm truncate">{stat.referrer}</span>
                    </div>
                    <span className="text-sm font-medium ml-2">{stat.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhum dado de origem ainda
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
