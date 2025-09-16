import { test, expect } from '@playwright/test';

test.describe('NPS Loop Fix Test', () => {
  test('should not have infinite loop in NPS page', async ({ page }) => {
    // Interceptar requisições para contar quantas vezes são feitas
    const requests = {
      messageSchedules: 0,
      statistics: 0,
      permissions: 0
    };

    // Interceptar requisições GET para message_schedules
    page.route('**/rest/v1/message_schedules*', async (route) => {
      requests.messageSchedules++;
      console.log(`GET message_schedules - Count: ${requests.messageSchedules}`);
      await route.continue();
    });

    // Interceptar requisições POST para get_schedule_statistics
    page.route('**/rest/v1/rpc/get_schedule_statistics', async (route) => {
      requests.statistics++;
      console.log(`POST get_schedule_statistics - Count: ${requests.statistics}`);
      await route.continue();
    });

    // Interceptar requisições POST para validate_user_schedule_permissions
    page.route('**/rest/v1/rpc/validate_user_schedule_permissions', async (route) => {
      requests.permissions++;
      console.log(`POST validate_user_schedule_permissions - Count: ${requests.permissions}`);
      await route.continue();
    });

    // Fazer login
    await page.goto('http://localhost:8080/auth');
    await page.fill('input[type="email"]', 'admin@lamusic.com.br');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // Aguardar redirecionamento
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Navegar para a página NPS
    await page.goto('http://localhost:8080/nps');
    await page.waitForLoadState('networkidle');

    // Aguardar 5 segundos para verificar se há loop
    await page.waitForTimeout(5000);

    // Verificar se não há loop (máximo 3 requisições de cada tipo é aceitável)
    console.log('Final counts:', requests);
    
    expect(requests.messageSchedules).toBeLessThanOrEqual(3);
    expect(requests.statistics).toBeLessThanOrEqual(3);
    expect(requests.permissions).toBeLessThanOrEqual(3);

    // Verificar se a página carregou corretamente
    await expect(page.locator('h1, h2, h3').filter({ hasText: /NPS|Pesquisa/i })).toBeVisible();
  });
});