"use client"

import { Flag, CheckCircle2, XCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import type { FeatureFlag } from "@/lib/types/feature-flags"

interface FeatureFlagCardProps {
  flag: FeatureFlag
  onToggle: (id: string) => void
  onUpdate: (id: string, updates: Partial<FeatureFlag>) => void
}

export function FeatureFlagCard({ flag, onToggle, onUpdate }: FeatureFlagCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Flag className={`h-5 w-5 ${flag.enabled ? "text-success" : "text-muted-foreground"}`} />
            <div>
              <CardTitle className="text-base">{flag.name}</CardTitle>
              <p className="text-sm text-muted-foreground font-mono">{flag.key}</p>
            </div>
          </div>
          <Switch checked={flag.enabled} onCheckedChange={() => onToggle(flag.id)} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{flag.description}</p>

        {/* Environment Status */}
        <div>
          <p className="text-sm font-medium text-foreground mb-2">Environments</p>
          <div className="flex items-center gap-2">
            <Badge variant={flag.environments.production ? "default" : "secondary"} className="text-xs">
              {flag.environments.production ? (
                <CheckCircle2 className="h-3 w-3 mr-1" />
              ) : (
                <XCircle className="h-3 w-3 mr-1" />
              )}
              Production
            </Badge>
            <Badge variant={flag.environments.staging ? "default" : "secondary"} className="text-xs">
              {flag.environments.staging ? (
                <CheckCircle2 className="h-3 w-3 mr-1" />
              ) : (
                <XCircle className="h-3 w-3 mr-1" />
              )}
              Staging
            </Badge>
            <Badge variant={flag.environments.development ? "default" : "secondary"} className="text-xs">
              {flag.environments.development ? (
                <CheckCircle2 className="h-3 w-3 mr-1" />
              ) : (
                <XCircle className="h-3 w-3 mr-1" />
              )}
              Development
            </Badge>
          </div>
        </div>

        {/* Rollout Percentage */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-foreground">Rollout Percentage</p>
            <span className="text-sm font-mono text-foreground">{flag.rolloutPercentage}%</span>
          </div>
          <Slider
            value={[flag.rolloutPercentage]}
            onValueChange={([value]) => onUpdate(flag.id, { rolloutPercentage: value })}
            max={100}
            step={5}
            className="w-full"
          />
        </div>

        {/* Tags */}
        {flag.tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {flag.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Metadata */}
        <div className="pt-4 border-t border-border text-xs text-muted-foreground">
          <p>Created: {new Date(flag.createdAt).toLocaleString()}</p>
          <p>Updated: {new Date(flag.updatedAt).toLocaleString()}</p>
        </div>
      </CardContent>
    </Card>
  )
}
