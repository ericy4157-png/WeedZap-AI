"use client";

import { AlertTriangle, Clock, Shield } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalyzeResult } from "@/lib/types";
import { getConfidenceLevel } from "@/lib/types";

type WarningsPanelProps = {
  result: AnalyzeResult;
};

export function WarningsPanel({ result }: WarningsPanelProps) {
  const showSimilar = getConfidenceLevel(result.confidence) === "low";

  return (
    <div className="space-y-4">
      <Card className="rounded-2xl border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="leading-relaxed text-muted-foreground">
            {result.weed.description}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {result.weed.cropsAffected.map((crop) => (
              <Badge key={crop} variant="secondary" className="rounded-full capitalize">
                Affects {crop}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Alert className="rounded-2xl">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Resistance</AlertTitle>
          <AlertDescription>{result.warnings.resistance}</AlertDescription>
        </Alert>
        <Alert className="rounded-2xl">
          <Clock className="h-4 w-4" />
          <AlertTitle>Timing</AlertTitle>
          <AlertDescription>{result.warnings.timing}</AlertDescription>
        </Alert>
        <Alert className="rounded-2xl">
          <Shield className="h-4 w-4" />
          <AlertTitle>Safety</AlertTitle>
          <AlertDescription>{result.warnings.safety}</AlertDescription>
        </Alert>
      </div>

      {(showSimilar || result.similarSpecies.length > 0) && (
        <Card className="rounded-2xl border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">
              {showSimilar ? "Possible Similar Species" : "Similar-Looking Weeds"}
            </CardTitle>
            {showSimilar && (
              <p className="text-sm text-muted-foreground">
                Confidence is below 80%. These species look similar — verify in
                the field before treating.
              </p>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {result.similarSpecies.map((species) => (
                <Badge
                  key={species}
                  variant={showSimilar ? "destructive" : "outline"}
                  className="rounded-full px-4 py-1.5 text-sm"
                >
                  {species}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Alert variant="default" className="rounded-2xl border-amber-500/30 bg-amber-500/5">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertTitle>Disclaimer</AlertTitle>
        <AlertDescription>
          Recommendations are for informational purposes only. Always consult
          your local extension office, certified crop advisor, and product labels
          before applying herbicides. Regulations vary by state and crop.
        </AlertDescription>
      </Alert>
    </div>
  );
}
