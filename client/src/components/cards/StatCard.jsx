import { motion } from "framer-motion";

function StatCard({
    title,
    value,
    icon,
    color = "text-green-400"
}) {

    return (

        <motion.div
            whileHover={{
                y: -6,
                scale: 1.02
            }}
            className="bg-[#131C2E] rounded-2xl p-6 shadow-xl border border-white/5"
        >

            <div className="flex justify-between items-center">

                <div>

                    <p className="text-gray-400 text-sm">
                        {title}
                    </p>

                    <h2 className={`text-4xl font-bold mt-3 ${color}`}>
                        {value}
                    </h2>

                </div>

                <div className="text-green-400">

                    {icon}

                </div>

            </div>

        </motion.div>

    );

}

export default StatCard;