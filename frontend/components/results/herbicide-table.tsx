"use client";

import { motion } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { RankedRecommendation } from "@/lib/types";

type HerbicideTableProps = {
  recommendations: RankedRecommendation[];
};

export function HerbicideTable({ recommendations }: HerbicideTableProps) {
  if (recommendations.length === 0) {
    return (
      <Card className="rounded-2xl">
        <CardContent className="py-8 text-center text-muted-foreground">
          No herbicide recommendations found for this crop, location, and growth
          stage combination. Consult your local extension office.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle>Recommended Herbicides</CardTitle>
        <p className="text-sm text-muted-foreground">
          Ranked by estimated effectiveness for your selected context
        </p>
      </CardHeader>
      <CardContent>
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Active Ingredient</TableHead>
                <TableHead>Effectiveness</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Timing</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recommendations.map((rec) => (
                <TableRow key={`${rec.rank}-${rec.name}`}>
                  <TableCell className="font-medium">{rec.rank}</TableCell>
                  <TableCell className="font-medium">{rec.name}</TableCell>
                  <TableCell>{rec.activeIngredient}</TableCell>
                  <TableCell>
                    <span className="font-semibold text-primary">
                      {rec.effectiveness}%
                    </span>
                  </TableCell>
                  <TableCell>{rec.rate}</TableCell>
                  <TableCell>{rec.timing}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="space-y-4 md:hidden">
          {recommendations.map((rec, i) => (
            <motion.div
              key={`${rec.rank}-${rec.name}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border bg-muted/20 p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-medium text-muted-foreground">
                    #{rec.rank}
                  </span>
                  <p className="font-semibold">{rec.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {rec.activeIngredient}
                  </p>
                </div>
                <span className="text-lg font-bold text-primary">
                  {rec.effectiveness}%
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Rate</p>
                  <p>{rec.rate}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Timing</p>
                  <p>{rec.timing}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
