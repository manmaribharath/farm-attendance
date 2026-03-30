import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator as CalcIcon } from "lucide-react";
import { useState } from "react";

function safeEval(expr: string): number {
  // Only allow digits, spaces, and operators +, -, *, /
  if (!/^[\d\s+\-*/().]+$/.test(expr)) throw new Error("Invalid");
  // Use Function constructor for safe eval
  // biome-ignore lint/security/noGlobalEval: intentional safe calculator
  const result = new Function(`"use strict"; return (${expr})`)();
  if (typeof result !== "number" || !Number.isFinite(result))
    throw new Error("Invalid");
  return result;
}

const QUICK_EXPRS = [
  { label: "500 × 5", value: "500*5" },
  { label: "750 × 26", value: "750*26" },
  { label: "400 / 2", value: "400/2" },
  { label: "300 + 150", value: "300+150" },
];

export default function Calculator() {
  const [expr, setExpr] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const calculate = () => {
    if (!expr.trim()) return;
    try {
      const val = safeEval(expr.trim());
      setResult(
        `₹ ${val.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`,
      );
      setIsError(false);
    } catch {
      setResult("Invalid expression");
      setIsError(true);
    }
  };

  return (
    <div className="space-y-4 max-w-md">
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CalcIcon className="w-4 h-4 text-primary" />
            Wage Calculator
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Calculate wages using +, -, *, / operators
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="calc-expr">Expression</Label>
            <Input
              id="calc-expr"
              data-ocid="calculator.expr.input"
              placeholder="e.g. 500*5 + 200"
              value={expr}
              onChange={(e) => {
                setExpr(e.target.value);
                setResult(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && calculate()}
              className="font-mono text-base"
            />
          </div>

          <Button
            type="button"
            data-ocid="calculator.calculate.button"
            onClick={calculate}
            className="w-full"
          >
            Calculate
          </Button>

          {result !== null && (
            <div
              data-ocid={
                isError
                  ? "calculator.result.error_state"
                  : "calculator.result.success_state"
              }
              className={`rounded-lg p-4 text-center ${
                isError
                  ? "bg-destructive/10 text-destructive"
                  : "bg-status-full/10 text-status-full"
              }`}
            >
              <p className="text-xs font-medium uppercase tracking-wide mb-1">
                Result
              </p>
              <p
                className={`text-2xl font-bold ${
                  isError ? "text-destructive" : "text-status-full"
                }`}
              >
                {result}
              </p>
            </div>
          )}

          {/* Quick expressions */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">
              Quick examples:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_EXPRS.map((q) => (
                <button
                  type="button"
                  key={q.value}
                  onClick={() => {
                    setExpr(q.value);
                    setResult(null);
                  }}
                  className="px-3 py-2 text-xs border border-border rounded-lg hover:bg-muted/50 text-left transition-colors font-mono"
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <p className="text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()}. Built with ❤️ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground"
        >
          caffeine.ai
        </a>
      </p>
    </div>
  );
}
