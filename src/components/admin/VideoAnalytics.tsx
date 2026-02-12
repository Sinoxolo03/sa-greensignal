import { useState } from 'react';
import { BarChart3, Download, Eye, Play, Clock, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';

const INITIAL_VIDEO_DISPLAY = 5;
const INITIAL_DATE_DISPLAY = 7;
const INITIAL_LOGS_DISPLAY = 20;

export function VideoAnalytics() {
  const { summary, data, loading, dateRange, setDateRange, exportToCSV } = useAnalyticsData();
  const [showDetails, setShowDetails] = useState(false);
  const [showAllVideos, setShowAllVideos] = useState(false);
  const [showAllDates, setShowAllDates] = useState(false);
  const [logsToShow, setLogsToShow] = useState(INITIAL_LOGS_DISPLAY);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  const videoStats = summary?.byVideo || [];
  const dateStats = summary?.byDate || [];
  const displayedVideos = showAllVideos ? videoStats : videoStats.slice(0, INITIAL_VIDEO_DISPLAY);
  const displayedDates = showAllDates ? dateStats : dateStats.slice(0, INITIAL_DATE_DISPLAY);
  const displayedLogs = data.slice(0, logsToShow);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Video Analytics
          </CardTitle>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Label htmlFor="from-date" className="text-sm whitespace-nowrap">From:</Label>
              <Input
                id="from-date"
                type="date"
                value={dateRange.from.toISOString().split('T')[0]}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: new Date(e.target.value) }))}
                className="w-auto"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="to-date" className="text-sm whitespace-nowrap">To:</Label>
              <Input
                id="to-date"
                type="date"
                value={dateRange.to.toISOString().split('T')[0]}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: new Date(e.target.value) }))}
                className="w-auto"
              />
            </div>
            <Button onClick={exportToCSV} variant="outline" size="sm" disabled={data.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-muted">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Eye className="h-4 w-4" />
                  Total Views
                </div>
              </div>
              <div className="text-3xl font-bold">{summary?.totalViews || 0}</div>
            </CardContent>
          </Card>
          <Card className="border-orange-200 bg-orange-50/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-orange-600 text-sm">
                  <Eye className="h-4 w-4" />
                  Site Visits
                </div>
                <Badge variant="outline" className="text-xs">{'<5s'}</Badge>
              </div>
              <div className="text-3xl font-bold text-orange-600">{summary?.totalVisits || 0}</div>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-green-600 text-sm">
                  <Play className="h-4 w-4" />
                  Watches
                </div>
                <Badge variant="outline" className="text-xs">5s+</Badge>
              </div>
              <div className="text-3xl font-bold text-green-600">{summary?.totalWatches || 0}</div>
            </CardContent>
          </Card>
          <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-blue-600 text-sm mb-2">
                <Clock className="h-4 w-4" />
                Avg Duration
              </div>
              <div className="text-3xl font-bold text-blue-600">{summary?.avgDuration || 0}s</div>
            </CardContent>
          </Card>
        </div>

        {/* Per Video Stats */}
        {videoStats.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Play className="h-4 w-4" />
              Stats by Video
              <Badge variant="secondary" className="ml-2">{videoStats.length}</Badge>
            </h3>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Video</TableHead>
                    <TableHead className="font-semibold">Company</TableHead>
                    <TableHead className="text-center font-semibold">Visits</TableHead>
                    <TableHead className="text-center font-semibold">Watches</TableHead>
                    <TableHead className="text-center font-semibold">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedVideos.map((video) => (
                    <TableRow key={video.videoId}>
                      <TableCell className="font-medium">{video.videoTitle}</TableCell>
                      <TableCell className="text-muted-foreground">{video.companyName}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200">
                          {video.visits}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                          {video.watches}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className="font-semibold">{video.visits + video.watches}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {videoStats.length > INITIAL_VIDEO_DISPLAY && (
              <Button 
                variant="outline" 
                onClick={() => setShowAllVideos(!showAllVideos)}
                className="w-full"
              >
                {showAllVideos ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-2" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-2" />
                    Show {videoStats.length - INITIAL_VIDEO_DISPLAY} More Videos
                  </>
                )}
              </Button>
            )}
          </div>
        )}

        {/* Daily Stats */}
        {dateStats.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Daily Breakdown
              <Badge variant="secondary" className="ml-2">{dateStats.length} days</Badge>
            </h3>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="text-center font-semibold">Visits</TableHead>
                    <TableHead className="text-center font-semibold">Watches</TableHead>
                    <TableHead className="text-center font-semibold">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedDates.map((day) => (
                    <TableRow key={day.date}>
                      <TableCell className="font-medium">{day.date}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200">
                          {day.visits}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                          {day.watches}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className="font-semibold">{day.visits + day.watches}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {dateStats.length > INITIAL_DATE_DISPLAY && (
              <Button 
                variant="outline" 
                onClick={() => setShowAllDates(!showAllDates)}
                className="w-full"
              >
                {showAllDates ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-2" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-2" />
                    Show {dateStats.length - INITIAL_DATE_DISPLAY} More Days
                  </>
                )}
              </Button>
            )}
          </div>
        )}

        {/* Detailed View Toggle */}
        {data.length > 0 && (
          <div className="space-y-3">
            <Button 
              variant={showDetails ? "default" : "outline"}
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Hide' : 'Show'} Detailed Logs
              <Badge variant="secondary" className="ml-2">{data.length}</Badge>
            </Button>
            
            {showDetails && (
              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-96 overflow-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-muted/50">
                      <TableRow>
                        <TableHead className="font-semibold">Date/Time</TableHead>
                        <TableHead className="font-semibold">Video</TableHead>
                        <TableHead className="font-semibold">Type</TableHead>
                        <TableHead className="font-semibold text-right">Duration</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {displayedLogs.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className="text-sm font-mono">
                            {new Date(row.created_at).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-sm">{row.video_title}</TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline"
                              className={
                                row.view_type === 'watch' 
                                  ? 'bg-green-50 text-green-700 border-green-200' 
                                  : 'bg-orange-50 text-orange-700 border-orange-200'
                              }
                            >
                              {row.view_type === 'watch' ? 'Watch' : 'Visit'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm">{row.duration_seconds}s</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {data.length > logsToShow && (
                  <div className="p-4 border-t bg-muted/30">
                    <Button 
                      variant="outline" 
                      onClick={() => setLogsToShow(prev => prev + INITIAL_LOGS_DISPLAY)}
                      className="w-full"
                    >
                      <ChevronDown className="h-4 w-4 mr-2" />
                      Show {Math.min(INITIAL_LOGS_DISPLAY, data.length - logsToShow)} More Logs
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {data.length === 0 && (
          <div className="text-center py-12 border rounded-lg bg-muted/20">
            <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground font-medium">No analytics data yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Views will appear here once users start watching videos
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}