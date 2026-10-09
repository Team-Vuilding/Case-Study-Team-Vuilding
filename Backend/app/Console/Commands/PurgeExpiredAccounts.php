<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PurgeExpiredAccounts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'accounts:purge-expired {--dry-run : List accounts eligible for deletion without deleting them}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Permanently delete deactivated accounts whose 30-day recovery deadline has expired';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');

        $expiredUsers = User::query()
            ->where(function ($query) {
                $query->where('account_status', 'deactivated')
                    ->orWhere('is_active', false);
            })
            ->whereNotNull('deletion_at')
            ->where('deletion_at', '<=', now())
            ->get();

        if ($expiredUsers->isEmpty()) {
            $this->info('No expired deactivated accounts found.');

            return self::SUCCESS;
        }

        $this->info(sprintf('Found %d account(s) past the 30-day recovery deadline.', $expiredUsers->count()));

        $purgedCount = 0;

        foreach ($expiredUsers as $user) {
            $email = $user->email;
            $name = $user->name;
            $deletionAt = $user->deletion_at?->toIso8601String();

            if ($dryRun) {
                $this->line(sprintf(' [DRY RUN] Would permanently delete: %s (%s), expired at %s', $name, $email, $deletionAt));
                continue;
            }

            try {
                DB::transaction(function () use ($user, $name, $email) {
                    // Revoke all active API tokens for this account
                    DB::table('api_tokens')->where('user_id', $user->id)->delete();

                    // Record permanent account purge in the audit log
                    DB::table('audit_events')->insert([
                        'user_id' => null,
                        'actor' => 'System Scheduler',
                        'event_type' => 'Account Purged',
                        'severity' => 'warning',
                        'description' => sprintf(
                            'Account "%s" (%s) was permanently deleted after the 30-day recovery period expired.',
                            $name,
                            $email
                        ),
                        'target' => $email,
                        'created_at' => now(),
                    ]);

                    // Permanently delete user record; related FKs have ON DELETE SET NULL
                    $user->delete();
                });

                $purgedCount++;
                $this->info(sprintf(' Permanently deleted: %s (%s)', $name, $email));
                Log::info(sprintf('Purged expired account: %s (%s)', $name, $email));
            } catch (\Throwable $e) {
                $this->error(sprintf(' Failed to delete account %s: %s', $email, $e->getMessage()));
                Log::error(sprintf('Failed purging account %s: %s', $email, $e->getMessage()));
            }
        }

        if (! $dryRun) {
            $this->info(sprintf('Successfully purged %d expired account(s).', $purgedCount));
        }

        return self::SUCCESS;
    }
}
