'use client';

import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { GlassCard, ProgressBar, SectionHeader, Badge, Button } from '@/components/ui';
import { RESOURCE_INFO, CRAFTING_RECIPES } from '@/core/constants';
import { RESOURCE_ICONS } from '@/components/ui/icons';
import { calculateProductionSummary } from '@/core/math';
import { staggerContainer, fadeInUp } from '@/lib/animations';
import { Package, BarChart3, Hammer, Swords, Beef, Landmark, type LucideIcon } from 'lucide-react';
import type { ResourceType } from '@/core/types';

// Crafting recipe icons mapping
const RECIPE_ICONS: Record<string, LucideIcon> = {
    forge_weapons: Swords,
    host_feast: Beef,
    build_monument: Landmark,
};

export function ResourcesPanel() {
    const state = useGameStore();
    const { inventory, capacity, executeCraft } = state;

    // Calculate production summary
    const production = calculateProductionSummary(state);

    const resourceList: ResourceType[] = [
        'grain', 'iron', 'timber', 'stone', 'clay',
        'wool', 'salt', 'livestock', 'wine', 'olive_oil', 'spices'
    ];

    const getResourceCategory = (resource: ResourceType): string => {
        if (['grain', 'livestock'].includes(resource)) return 'Food';
        if (['iron', 'stone', 'clay', 'timber'].includes(resource)) return 'Materials';
        if (['wine', 'olive_oil', 'spices', 'salt', 'wool'].includes(resource)) return 'Trade Goods';
        return 'Other';
    };

    const categories = ['Food', 'Materials', 'Trade Goods'];

    // Check if player can craft a recipe
    const canCraft = (recipeId: string): boolean => {
        const recipe = CRAFTING_RECIPES.find(r => r.id === recipeId);
        if (!recipe) return false;
        return recipe.inputs.every(input => (inventory[input.resource] || 0) >= input.amount);
    };

    return (
        <div className="p-6 space-y-6 fade-in">
            <SectionHeader
                title="Resources"
                subtitle="Manage your empire's resources and production"
                icon={<Package className="w-6 h-6 text-roman-gold" />}
            />

            {/* Production Summary */}
            <GlassCard variant="gold" className="p-4">
                <h3 className="text-lg font-bold text-roman-gold mb-3 flex items-center gap-2">
                    <BarChart3 size={20} className="text-roman-gold" />
                    Season Production
                </h3>
                <motion.div
                    className="grid grid-cols-2 md:grid-cols-4 gap-4"
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                >
                    <motion.div variants={fadeInUp} className="text-center">
                        <div className="text-2xl font-bold text-green-400">+{production.income}</div>
                        <div className="text-xs text-muted">Income</div>
                    </motion.div>
                    <motion.div variants={fadeInUp} className="text-center">
                        <div className="text-2xl font-bold text-red-400">-{production.upkeep}</div>
                        <div className="text-xs text-muted">Upkeep</div>
                    </motion.div>
                    <motion.div variants={fadeInUp} className="text-center">
                        <div className={`text-2xl font-bold ${production.netIncome >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {production.netIncome >= 0 ? '+' : ''}{production.netIncome}
                        </div>
                        <div className="text-xs text-muted">Net Income</div>
                    </motion.div>
                    <motion.div variants={fadeInUp} className="text-center">
                        <div className="text-2xl font-bold text-orange-400">-{production.foodConsumption}</div>
                        <div className="text-xs text-muted">Food Consumed</div>
                    </motion.div>
                </motion.div>
            </GlassCard>

            {/* Resources by Category */}
            {categories.map(category => {
                const categoryResources = resourceList.filter(r => getResourceCategory(r) === category);

                return (
                    <GlassCard key={category} className="p-4">
                        <h3 className="text-lg font-bold text-roman-gold mb-4">{category}</h3>

                        <div className="space-y-4">
                            {categoryResources.map((resource, idx) => {
                                const info = RESOURCE_INFO[resource];
                                const current = inventory[resource] || 0;
                                const max = capacity[resource] || 100;
                                const prod = production.resources[resource] || 0;
                                const percentage = (current / max) * 100;

                                return (
                                    <motion.div
                                        key={resource}
                                        className="space-y-2"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {(() => {
                                                    const ResourceIcon = RESOURCE_ICONS[resource] || Package;
                                                    return <ResourceIcon size={20} className="text-roman-gold" />;
                                                })()}
                                                <span className="font-medium">{info.name}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {prod > 0 && (
                                                    <Badge variant="success" size="sm">+{prod.toFixed(1)}/season</Badge>
                                                )}
                                                <span className="font-mono text-sm">
                                                    {current}/{max}
                                                </span>
                                            </div>
                                        </div>

                                        <ProgressBar
                                            value={current}
                                            max={max}
                                            variant={percentage > 80 ? 'gold' : percentage > 50 ? 'default' : 'danger'}
                                            showLabel={false}
                                            height="sm"
                                        />
                                    </motion.div>
                                );
                            })}
                        </div>
                    </GlassCard>
                );
            })}

            {/* Capacity Overview */}
            <GlassCard className="p-4">
                <h3 className="text-lg font-bold text-roman-gold mb-3">Storage Capacity</h3>
                <p className="text-sm text-muted mb-4">
                    Build granaries, warehouses, and markets to increase storage capacity.
                </p>
                <motion.div
                    className="grid grid-cols-3 gap-2 text-center text-sm"
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                >
                    {resourceList.slice(0, 6).map(resource => {
                        const ResourceIcon = RESOURCE_ICONS[resource] || Package;
                        return (
                            <motion.div
                                key={resource}
                                variants={fadeInUp}
                                className="glass-dark rounded-lg p-2 flex items-center justify-center gap-1"
                            >
                                <ResourceIcon size={16} className="text-roman-gold" />
                                <span className="text-muted">{capacity[resource]}</span>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </GlassCard>

            {/* Crafting Section */}
            <GlassCard className="p-4">
                <h3 className="text-lg font-bold text-roman-gold mb-3 flex items-center gap-2">
                    <Hammer size={20} className="text-roman-gold" />
                    Crafting
                </h3>
                <p className="text-sm text-muted mb-4">
                    Combine resources to create powerful effects for your empire.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {CRAFTING_RECIPES.map((recipe) => {
                        const craftable = canCraft(recipe.id);
                        const inputText = recipe.inputs
                            .map(i => `${i.amount} ${RESOURCE_INFO[i.resource]?.name || i.resource}`)
                            .join(' + ');
                        const effectText = recipe.effect.duration
                            ? `+${(recipe.effect.value * 100).toFixed(0)}% ${recipe.effect.type} for ${recipe.effect.duration} seasons`
                            : `+${recipe.effect.value} ${recipe.effect.type}`;

                        return (
                            <motion.div
                                key={recipe.id}
                                className={`p-4 rounded-xl border ${craftable ? 'bg-roman-gold/5 border-roman-gold/30 hover:border-roman-gold/50' : 'bg-white/5 border-white/10 opacity-60'}`}
                                whileHover={craftable ? { scale: 1.01 } : {}}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        {(() => {
                                            const RecipeIcon = RECIPE_ICONS[recipe.id] || Hammer;
                                            return <RecipeIcon size={24} className="text-roman-gold" />;
                                        })()}
                                        <div>
                                            <h4 className="font-bold text-sm">{recipe.name}</h4>
                                            <p className="text-xs text-muted">{recipe.description}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-xs">
                                        <span className="text-muted">Cost:</span>
                                        <span className={craftable ? 'text-ink' : 'text-red-400'}>{inputText}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs">
                                        <span className="text-muted">Effect:</span>
                                        <span className="text-green-400">{effectText}</span>
                                    </div>
                                </div>
                                <Button
                                    variant={craftable ? 'roman' : 'ghost'}
                                    size="sm"
                                    fullWidth
                                    className="mt-3"
                                    disabled={!craftable}
                                    onClick={() => executeCraft(recipe.id)}
                                >
                                    {craftable ? 'Craft' : 'Insufficient Resources'}
                                </Button>
                            </motion.div>
                        );
                    })}
                </div>
            </GlassCard>
        </div>
    );
}
