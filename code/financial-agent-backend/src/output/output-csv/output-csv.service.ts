import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class OutputCsvService {
  private readonly logger = new Logger(OutputCsvService.name);

  public async salvarLinhaNoOutputCsv(dadosDaResposta: {
    request_id: string;
    amount_safe_to_pay: number;
    affordability_status: string;
    recommended_payment_method: string;
    payment_plan: string;
    earliest_date_for_full_payment: string;
    spending_changes_needed: string;
    decision_explanation: string;
  }) {

    const diretorioDataset = path.resolve(process.cwd(), '..', '..', 'dataset');
    const caminhoOutput = path.resolve(process.cwd(), '..', '..', 'output.csv');

    if (!fs.existsSync(diretorioDataset)) {
      fs.mkdirSync(diretorioDataset, { recursive: true });
    }

    if (!fs.existsSync(caminhoOutput)) {
      const cabecalho = [
        'request_id',
        'amount_safe_to_pay',
        'affordability_status',
        'recommended_payment_method',
        'payment_plan',
        'earliest_date_for_full_payment',
        'spending_changes_needed',
        'decision_explanation',
      ]+ '\n';

      fs.writeFileSync(caminhoOutput, cabecalho, 'utf-8');
    }

    const linhaCsv = [
      dadosDaResposta.request_id,
      dadosDaResposta.amount_safe_to_pay,
      dadosDaResposta.affordability_status,
      dadosDaResposta.recommended_payment_method,
      dadosDaResposta.payment_plan,
      dadosDaResposta.earliest_date_for_full_payment,
      dadosDaResposta.spending_changes_needed,
      `"${dadosDaResposta.decision_explanation.replace(/"/g, '""')}"`,
    ].join(',');

    fs.appendFileSync(caminhoOutput, linhaCsv);
    
    this.logger.log(`Resultado do request ${dadosDaResposta.request_id} salvo com sucesso em output.csv`);
  }
}