import { motion } from 'framer-motion'

const PageTransition = ({ children }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }} // يبدأ شفاف وتحت شوية
            animate={{ opacity: 1, y: 0 }}  // يظهر ويطلع مكانه
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}    // مدة الحركة
        >
            {children}
        </motion.div>
    )
}

export default PageTransition