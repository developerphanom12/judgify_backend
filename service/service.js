import db from "../database/connection.js"
import dotenv from "dotenv"
dotenv.config()

const resposne = {
    criteriaAlreadyDeleted: "Criteria Already deleted",
    criteriaNotFound: "Criteria not found.",
    criteriaDeleted: "Criteria deleted successfully.",
}

async function queryDb(sql, params) {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, result) => {
            if (err) return reject(err)
            resolve(result)
        })
    })
}

async function softDelete(table, criteriaId) {
    const updateSql = `UPDATE ${table} SET is_deleted = 1 WHERE id = ?`

    try {
        const result = await queryDb(updateSql, [criteriaId])

        if (result.affectedRows === 0) {
            throw new Error(resposne.criteriaNotFound)
        }

        return resposne.criteriaDeleted
    } catch (error) {
        throw new Error(error.message)
    }
}

export async function softDeleteCriteria(criteriaId) {
    return softDelete('criteria', criteriaId)
}

export async function softDeleteCriteriaSettings(criteriaId) {
    return softDelete('criteria_settings', criteriaId)
}

export async function checkIfDeletedCriteria(criteriaId) {
    const criteriaQuery = "SELECT is_deleted FROM criteria WHERE id = ?"
    const settingsQuery = "SELECT is_deleted FROM criteria_settings WHERE criteriaId = ?"
    const settingsValuesQuery = "SELECT is_deleted FROM criteria_settings_values WHERE criteriaId = ?"

    try {
        const criteriaResults = await queryDb(criteriaQuery, [criteriaId])
        if (criteriaResults.length === 0) {
            throw new Error(resposne.criteriaNotFound)
        }

        const isCriteriaDeleted = criteriaResults[0].is_deleted === 1

        const settingsResults = await queryDb(settingsQuery, [criteriaId])
        const isSettingsDeleted = settingsResults.length > 0 && settingsResults[0].is_deleted === 1

        const settingsValuesResults = await queryDb(settingsValuesQuery, [criteriaId])
        const isSettingsValuesDeleted = settingsValuesResults.length > 0 && settingsValuesResults[0].is_deleted === 1

        return {
            isDeleted: isCriteriaDeleted,
            isSettingsDeleted,
            isSettingsValuesDeleted,
        }
    } catch (error) {
        throw new Error(error.message)
    }
}

export async function softDeleteSettingsByCriteriaId(criteriaId) {
    const updateSql = `UPDATE criteria_settings SET is_deleted = 1 WHERE criteriaId = ?`
    return queryDb(updateSql, [criteriaId])
}

export async function softDeleteSettingsValuesByCriteriaId(criteriaId) {
    const updateSql = `UPDATE criteria_settings_values SET is_deleted = 1 WHERE criteriaId = ?`
    return queryDb(updateSql, [criteriaId])
}
