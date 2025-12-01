import type { Schema } from '../../data/resource';
import { DynamoDBClient, ListTablesCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

/**
 * Verify Redemption Lambda Function
 *
 * Business portal calls this to verify and fulfill a redemption
 */

interface VerifyRedemptionArgs {
  redemptionCode: string;
  businessId: string;
  verifiedBy?: string;
}

// Cache for table names
let redemptionTableName: string | null = null;

async function getTableNames() {
  if (redemptionTableName) {
    return { redemptionTableName };
  }

  const dynamodb = new DynamoDBClient({});
  const result = await dynamodb.send(new ListTablesCommand({}));
  const tables = result.TableNames || [];

  redemptionTableName = tables.find((t: string) => t.startsWith('RewardRedemption-') && t.endsWith('-NONE')) || 'RewardRedemption';

  console.log(`📋 Discovered table: RewardRedemption=${redemptionTableName}`);

  return { redemptionTableName };
}

export const handler = async (event: any) => {
  const args = event.arguments as VerifyRedemptionArgs;

  console.log('🔍 Verify redemption:', { redemptionCode: args.redemptionCode, businessId: args.businessId });

  try {
    const { redemptionTableName: tableName } = await getTableNames();

    // Find redemption by code (need to scan since redemptionCode is not the primary key)
    // In production, consider adding a GSI on redemptionCode for better performance
    const redemption = await findRedemptionByCode(tableName, args.redemptionCode);

    if (!redemption) {
      return {
        success: false,
        redemption: null,
        error: 'Redemption code not found',
      };
    }

    // Verify business ID matches
    if (redemption.businessId !== args.businessId) {
      return {
        success: false,
        redemption: null,
        error: 'This redemption is for a different business',
      };
    }

    // Check if already redeemed
    if (redemption.redemptionStatus === 'REDEEMED') {
      return {
        success: false,
        redemption: null,
        error: 'This redemption has already been fulfilled',
      };
    }

    // Check if expired
    const now = new Date();
    const expiresAt = new Date(redemption.expiresAt);
    if (now > expiresAt) {
      // Mark as expired
      await updateRedemptionStatus(tableName, redemption.id, 'EXPIRED');
      return {
        success: false,
        redemption: null,
        error: 'This redemption has expired',
      };
    }

    // Mark as fulfilled
    const updateCommand = new UpdateCommand({
      TableName: tableName,
      Key: { id: redemption.id },
      UpdateExpression: 'SET redemptionStatus = :status, businessVerifiedAt = :verifiedAt, businessVerifiedBy = :verifiedBy, fulfilledAt = :fulfilledAt, updatedAt = :now',
      ExpressionAttributeValues: {
        ':status': 'REDEEMED',
        ':verifiedAt': now.toISOString(),
        ':verifiedBy': args.verifiedBy || 'Business Staff',
        ':fulfilledAt': now.toISOString(),
        ':now': now.toISOString(),
      },
      ReturnValues: 'ALL_NEW',
    });

    const result = await docClient.send(updateCommand);

    console.log(`✅ Redemption verified and fulfilled: ${redemption.id}`);

    return {
      success: true,
      redemption: result.Attributes,
      error: undefined,
    };
  } catch (error) {
    console.error('❌ Error verifying redemption:', error);
    return {
      success: false,
      redemption: null,
      error: error instanceof Error ? error.message : 'Failed to verify redemption',
    };
  }
};

/**
 * Find redemption by code (requires table scan)
 * TODO: Add GSI on redemptionCode for better performance
 */
async function findRedemptionByCode(tableName: string, code: string): Promise<any> {
  const { ScanCommand } = await import('@aws-sdk/lib-dynamodb');

  const command = new ScanCommand({
    TableName: tableName,
    FilterExpression: 'redemptionCode = :code',
    ExpressionAttributeValues: {
      ':code': code,
    },
    Limit: 1,
  });

  const result = await docClient.send(command);
  return result.Items && result.Items.length > 0 ? result.Items[0] : null;
}

/**
 * Update redemption status
 */
async function updateRedemptionStatus(tableName: string, redemptionId: string, status: string) {
  const command = new UpdateCommand({
    TableName: tableName,
    Key: { id: redemptionId },
    UpdateExpression: 'SET redemptionStatus = :status, updatedAt = :now',
    ExpressionAttributeValues: {
      ':status': status,
      ':now': new Date().toISOString(),
    },
  });

  await docClient.send(command);
}
