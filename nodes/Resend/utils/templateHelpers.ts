import { TemplateVariable } from '../types';

/**
 * Convert template variables from fixedCollection to API format
 * Auto-detects numbers and converts them appropriately
 */
export function processTemplateVariables(variablesData: any): Record<string, string | number> {
	if (!variablesData?.variable?.length) {
		return {};
	}

	const variables: Record<string, string | number> = {};

	for (const variable of variablesData.variable) {
		if (variable.key && variable.value !== undefined) {
			// Try to parse as number if possible
			const numValue = Number(variable.value);
			variables[variable.key] =
				isNaN(numValue) || variable.value === '' ? variable.value : numValue;
		}
	}

	return variables;
}

/**
 * Convert fixedCollection tags to API format
 */
export function processEmailTags(
	tagsData: any,
): Array<{ name: string; value: string }> | undefined {
	if (!tagsData?.tag?.length) {
		return undefined;
	}

	const tags = tagsData.tag
		.filter((tag: any) => tag.name && tag.value !== undefined)
		.map((tag: any) => ({
			name: tag.name,
			value: tag.value,
		}));

	return tags.length > 0 ? tags : undefined;
}

/**
 * Convert contact properties from fixedCollection to API format
 */
export function processContactProperties(
	propertiesData: any,
): Record<string, string | number> | undefined {
	if (!propertiesData?.property?.length) {
		return undefined;
	}

	const properties: Record<string, string | number> = {};

	for (const prop of propertiesData.property) {
		if (prop.key && prop.value !== undefined) {
			// Convert based on type
			if (prop.type === 'number') {
				const numValue = Number(prop.value);
				properties[prop.key] = isNaN(numValue) ? prop.value : numValue;
			} else {
				properties[prop.key] = prop.value;
			}
		}
	}

	return Object.keys(properties).length > 0 ? properties : undefined;
}
